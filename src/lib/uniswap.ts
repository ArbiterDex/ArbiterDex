import { concatHex, decodeFunctionResult, encodeFunctionData, numberToHex, parseAbi, type Hex } from "viem";
import { USDG, WETH } from "@/config/tokens";

/* Exact-input routing on Uniswap v3, Robinhood Chain. Every candidate route
   (direct pools at each fee tier, and two-hop routes through WETH or USDG) is
   quoted on-chain by QuoterV2, and the swap is one SwapRouter02 multicall sent
   by the user's own wallet. No Arbiter DEX contract sits in between and no
   fee is added. Addresses match Uniswap's published Robinhood Chain
   deployment and were checked on-chain. */

export const UNISWAP = {
  factory: "0x1f7d7550b1b028f7571e69a784071f0205fd2efa",
  swapRouter02: "0xcaf681a66d020601342297493863e78c959e5cb2",
  quoterV2: "0x33e885ed0ec9bf04ecfb19341582aadcb4c8a9e7",
} as const;

export const NATIVE = "0x0000000000000000000000000000000000000000";
/** SwapRouter02 keeps output here before unwrapping WETH for the user. */
const ROUTER_SELF = "0x0000000000000000000000000000000000000002";

const FEES = [100, 500, 3000, 10000];

const QUOTER_ABI = parseAbi([
  "function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96)) returns (uint256 amountOut,uint160 sqrtPriceX96After,uint32 initializedTicksCrossed,uint256 gasEstimate)",
  "function quoteExactInput(bytes path,uint256 amountIn) returns (uint256 amountOut,uint160[] sqrtPriceX96AfterList,uint32[] initializedTicksCrossedList,uint256 gasEstimate)",
]);

const ROUTER_ABI = parseAbi([
  "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)",
  "function exactInput((bytes path,address recipient,uint256 amountIn,uint256 amountOutMinimum)) payable returns (uint256 amountOut)",
  "function multicall(uint256 deadline,bytes[] data) payable returns (bytes[] results)",
  "function unwrapWETH9(uint256 amountMinimum,address recipient) payable",
]);

const ERC20_ABI = parseAbi([
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
]);

export type Route =
  | { kind: "single"; tokenIn: Hex; tokenOut: Hex; fee: number; label: string; hops: string[] }
  | { kind: "path"; path: Hex; label: string; hops: string[] };

export type RouteQuote = { route: Route; amountOut: string; gasEstimate: number };

const pctFee = (fee: number) => `${fee / 10000}%`;
const wrap = (address: string) => (address.toLowerCase() === NATIVE ? (WETH as Hex) : (address as Hex));

function encodePath(tokens: Hex[], fees: number[]): Hex {
  const parts: Hex[] = [tokens[0]];
  fees.forEach((fee, i) => parts.push(numberToHex(fee, { size: 3 }), tokens[i + 1]));
  return concatHex(parts);
}

/** Every route worth quoting from `from` to `to` (native ETH as the zero address). */
export function candidates(from: { address: string; symbol: string }, to: { address: string; symbol: string }): Route[] {
  const A = wrap(from.address);
  const B = wrap(to.address);
  if (A.toLowerCase() === B.toLowerCase()) return [];
  const routes: Route[] = FEES.map((fee) => ({
    kind: "single",
    tokenIn: A,
    tokenOut: B,
    fee,
    label: `Uniswap v3 · direct pool, ${pctFee(fee)}`,
    hops: [from.symbol, to.symbol],
  }));
  const mids: { address: Hex; symbol: string }[] = [
    { address: WETH as Hex, symbol: "ETH" },
    { address: USDG.address as Hex, symbol: "USDG" },
  ];
  for (const mid of mids) {
    if (mid.address.toLowerCase() === A.toLowerCase() || mid.address.toLowerCase() === B.toLowerCase()) continue;
    for (const f1 of FEES)
      for (const f2 of FEES)
        routes.push({
          kind: "path",
          path: encodePath([A, mid.address, B], [f1, f2]),
          label: `Uniswap v3 · via ${mid.symbol}, ${pctFee(f1)} + ${pctFee(f2)}`,
          hops: [from.symbol, mid.symbol, to.symbol],
        });
  }
  return routes;
}

export function quoteCalldata(route: Route, amountIn: bigint): Hex {
  return route.kind === "single"
    ? encodeFunctionData({
        abi: QUOTER_ABI,
        functionName: "quoteExactInputSingle",
        args: [{ tokenIn: route.tokenIn, tokenOut: route.tokenOut, amountIn, fee: route.fee, sqrtPriceLimitX96: 0n }],
      })
    : encodeFunctionData({ abi: QUOTER_ABI, functionName: "quoteExactInput", args: [route.path, amountIn] });
}

export function decodeQuote(route: Route, raw: string | null): { amountOut: bigint; gasEstimate: bigint } | null {
  if (!raw || raw === "0x") return null;
  try {
    const out =
      route.kind === "single"
        ? decodeFunctionResult({ abi: QUOTER_ABI, functionName: "quoteExactInputSingle", data: raw as Hex })
        : decodeFunctionResult({ abi: QUOTER_ABI, functionName: "quoteExactInput", data: raw as Hex });
    return { amountOut: out[0], gasEstimate: out[3] };
  } catch {
    return null;
  }
}

export type TxRequest = { to: Hex; data: Hex; value?: bigint };

/** Minimum output after the slippage the user accepted, in basis points. */
export const withSlippage = (amountOut: bigint, slippageBps: number) => amountOut - (amountOut * BigInt(slippageBps)) / 10_000n;

/**
 * The swap itself: one SwapRouter02 multicall that expires after ten minutes.
 * Native ETH in is sent as value; native ETH out is unwrapped to the user in
 * the same transaction.
 */
export function swapTx(route: Route, from: string, to: string, amountIn: bigint, minOut: bigint, user: Hex): TxRequest {
  const ethIn = from.toLowerCase() === NATIVE;
  const ethOut = to.toLowerCase() === NATIVE;
  const recipient = ethOut ? (ROUTER_SELF as Hex) : user;
  const swap =
    route.kind === "single"
      ? encodeFunctionData({
          abi: ROUTER_ABI,
          functionName: "exactInputSingle",
          args: [{ tokenIn: route.tokenIn, tokenOut: route.tokenOut, fee: route.fee, recipient, amountIn, amountOutMinimum: minOut, sqrtPriceLimitX96: 0n }],
        })
      : encodeFunctionData({ abi: ROUTER_ABI, functionName: "exactInput", args: [{ path: route.path, recipient, amountIn, amountOutMinimum: minOut }] });
  const calls: Hex[] = [swap];
  if (ethOut) calls.push(encodeFunctionData({ abi: ROUTER_ABI, functionName: "unwrapWETH9", args: [minOut, user] }));
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 10 * 60);
  return {
    to: UNISWAP.swapRouter02,
    data: encodeFunctionData({ abi: ROUTER_ABI, functionName: "multicall", args: [deadline, calls] }),
    value: ethIn ? amountIn : 0n,
  };
}

/** Approval for exactly this swap's input, never unlimited. */
export function approveTx(token: string, amount: bigint): TxRequest {
  return { to: token as Hex, data: encodeFunctionData({ abi: ERC20_ABI, functionName: "approve", args: [UNISWAP.swapRouter02, amount] }) };
}

export function allowanceCalldata(owner: Hex): Hex {
  return encodeFunctionData({ abi: ERC20_ABI, functionName: "allowance", args: [owner, UNISWAP.swapRouter02] });
}

export function balanceCalldata(owner: Hex): Hex {
  return encodeFunctionData({ abi: ERC20_ABI, functionName: "balanceOf", args: [owner] });
}

/* Routes cross the wire as JSON, so bigint-free and self-describing. */
export type WireRoute = { kind: "single"; tokenIn: Hex; tokenOut: Hex; fee: number; label: string; hops: string[] } | { kind: "path"; path: Hex; label: string; hops: string[] };
