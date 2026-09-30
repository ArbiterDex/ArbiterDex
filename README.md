# Arbiter DEX

**The arbiter of fair trading.** Unified marketplace for tokenized assets with fair pricing, on Robinhood Chain.

Website: [arbiterdex.app](https://arbiterdex.app) · X: [@arbiterdex](https://x.com/arbiterdex) · Token: **$ARBITERDEX**

## The problem

Tokenized stocks, funds, commodities and treasuries now trade on-chain, but buying them fairly is harder than it looks:

- **The same asset has a different price on every venue.** One stock token can sit in dozens of pools, each quoting its own number.
- **Nobody tells you which price is honest.** A venue that quotes you is also the venue that profits from the trade.
- **Slippage hides in the route.** Thin pools and extra hops quietly cost you, and you only see it after you sign.
- **Liquidity is fragmented.** Depth is spread across pools, fee tiers and quote assets, so finding the best one takes work.
- **Look-alike tokens borrow famous tickers.** Picking the wrong contract is easy.

## The solution

Arbiter DEX acts as a neutral referee between you and the market:

- **Every venue is scanned.** Each order is quoted on-chain across every route that can fill it: direct pools at every fee tier and two-hop routes through ETH or USDG.
- **The fairest price is found automatically.** The best executable route is compared with an independent oracle (Chainlink on Robinhood Chain) and given a ruling: *Fair*, *Within tolerance* or *Unfair*, with the exact gap shown before you sign.
- **One order, best price.** You sign once; the route is chosen for you and you can still see every alternative.
- **Self-custody, no KYC.** There is no account and no deposit. Your wallet sends every transaction itself.
- **On-chain settlement, fully transparent.** Trades settle on Robinhood Chain through Uniswap's public router, with an explorer link for each one. Approvals are for the exact amount of one trade, never unlimited.
- **Only verified assets.** A stock token is listed only when its contract is proven on-chain to be the issuer's own; look-alikes are counted and never routed.

## What you can try

**Live today**

| Page | What it does |
| --- | --- |
| `/swap` | Real swaps between 36 verified stock and fund tokens, ETH and USDG on Robinhood Chain, with the fair-price ruling |
| `/assets`, `/assets/[ticker]` | Every verified asset with its oracle price, every venue that trades it, spread against the oracle, liquidity and volume |
| `/rwa-pools`, `/rwa-pools/[pool]` | Every public pool trading a verified asset, read live |
| `/explorer` | Recent on-chain swaps on the pools Arbiter DEX compares |
| `/portfolio` | Your real balances, valued at oracle prices, after you connect |
| `/launchpad/t/robinhood/[address]` | On-chain facts and pools for any token on Robinhood Chain |
| `/issuers`, `/docs` | Who issues each asset, and how rulings are made |

**Coming next** (shown as labelled previews; nothing is executed)

- Tokenized baskets: themed baskets of verified stock tokens, priced live leg by leg, bought in one order
- Lend and borrow: USDG against tokenized collateral, valued at the oracle
- Private settlement and bridging
- The launchpad and the **$ARBITERDEX** token page (the contract address appears on the site at launch)

## Run it locally

Requirements: **Node.js 20 or newer** and npm.

1. Download ZIP or fork this repository, then open the folder in a terminal.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build and start:
   ```bash
   npm run build
   npm start
   ```
4. Open **http://localhost:4730**.

For development with hot reload use `npm run dev` (same port).

### Optional environment variables

Nothing is required: the site runs on public endpoints. Create a `.env.local` file only if you want these:

| Variable | Where it is used | Format |
| --- | --- | --- |
| `ROBINHOOD_RPC_URL` | Server-side chain reads (a private RPC gives faster reads and longer log history for the explorer) | An HTTPS JSON-RPC URL for Robinhood Chain, for example from your RPC provider's dashboard |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Enables the WalletConnect option for mobile wallets | The project ID from cloud.reown.com |

On Vercel, add the same names under Project → Settings → Environment Variables and redeploy.

## Network in your wallet

Connecting from the site adds the network automatically. To add it by hand:

| Field | Value |
| --- | --- |
| Network name | Robinhood Chain |
| Chain ID | 4663 (0x1237) |
| Currency | ETH |
| RPC URL | https://rpc.mainnet.chain.robinhood.com |
| Explorer | https://robinhoodchain.blockscout.com |

Any EVM wallet that can add a custom network works (MetaMask, Rabby, OKX, Coinbase Wallet, and others). Phantom cannot add custom networks.

## Project layout

```
src/
  app/(site)/         marketplace pages: home, swap, assets, pools, baskets, lend, docs
  app/(launchpad)/    launchpad pages and the token page
  app/api/            read-only chain relay, market data, swap quotes, balances
  components/         UI, wallet connection, page sections
  config/brand.ts     name, links and the token contract address
  config/assets*.ts   verified asset list with Chainlink feeds
  lib/                market data, Uniswap routing, rulings, formatting
public/               token and wallet logos (.webp)
```

## Token contract

**$ARBITERDEX** on Robinhood Chain: published at launch.

The address is set in one place, `src/config/brand.ts`. Until it is a real address every copy button on the site shows "Published at launch" instead of copying a placeholder. Always check the address on the official site and X account before you trade.
