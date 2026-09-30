// Single place to change project identity. Everything on the site reads from here.
// The contract address is a placeholder until launch: replace CA below with the
// real 0x address and every copy button, explorer link and token page follows.

const CA = "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

export const isAddress = (v: string): v is `0x${string}` =>
  /^0x[0-9a-fA-F]{40}$/.test(v);

export const BRAND = {
  name: "Arbiter DEX",
  ticker: "ARBITERDEX",
  symbol: "$ARBITERDEX",
  domain: "arbiterdex.app",
  url: "https://arbiterdex.app",
  slogan: "The arbiter of fair trading.",
  tagline: "Unified marketplace for tokenized assets with fair pricing",
  description:
    "Arbiter DEX checks every venue for a tokenized asset, rules on the fairest price against an independent oracle, and settles your order on-chain from your own wallet.",
  x: "https://x.com/arbiterdex",
  xHandle: "@arbiterdex",
  /** Public GitHub repo. Empty hides every GitHub link on the site. */
  github: "https://github.com/ArbiterDex/ArbiterDex" as string,
  ca: CA,
} as const;

// Public endpoints are the default. An operator can point the server at a
// private RPC with ROBINHOOD_RPC_URL (optional). The browser never talks to the
// RPC host directly for reads; it goes through the /api/rpc relay.
const PUBLIC_RPC = "https://rpc.mainnet.chain.robinhood.com";

export const CHAIN = {
  id: 4663,
  hex: "0x1237",
  name: "Robinhood Chain",
  nativeSymbol: "ETH",
  decimals: 18,
  publicRpc: PUBLIC_RPC,
    /** Second public endpoint, used for reads only when the first one fails. */
  fallbackRpc: "https://robinhood-rpc.publicnode.com",
  explorer: "https://robinhoodchain.blockscout.com",
  explorerName: "Blockscout",
} as const;

/** RPC for server code: the private endpoint when set, else the public one. */
export function serverRpc() {
  return process.env.ROBINHOOD_RPC_URL || PUBLIC_RPC;
}

export const TOKEN = {
  get isLive() {
    return isAddress(BRAND.ca);
  },
};

export function explorerAddress(address: string) {
  return `${CHAIN.explorer}/address/${address}`;
}
export function explorerToken(address: string) {
  return `${CHAIN.explorer}/token/${address}`;
}
export function explorerTx(hash: string) {
  return `${CHAIN.explorer}/tx/${hash}`;
}
export function shortAddress(address: string, head = 6, tail = 4) {
  if (address.length <= head + tail + 2) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}
