/* Baskets built only from assets Arbiter DEX can verify and price on Robinhood
   Chain (see config/assets.ts). Weights are target weights by value and add up
   to 100. Nothing here is a live product yet: legs are priced live, but the
   one-order basket purchase and automated rebalancing open at launch. */

export type Leg = { symbol: string; weight: number };

export type GlyphName = "chip" | "atom" | "server" | "layers" | "shield" | "pick" | "tower" | "orbit" | "coin" | "scale" | "wave" | "grid" | "bars" | "gold";

export type IndexBasket = {
  kind: "index";
  symbol: string;
  name: string;
  tags: string[];
  summary: string;
  about: string;
  method: string;
  glyph: GlyphName;
  legs: Leg[];
};

export type StrategyGroup = "Rule-based core" | "AI and chips" | "Energy and resources" | "Sectors" | "Crypto equities" | "Yield and gold";

export type StrategyBasket = {
  kind: "automated";
  slug: string;
  name: string;
  group: StrategyGroup;
  rule: string;
  summary: string;
  about: string;
  rebalance: string;
  glyph: GlyphName;
  legs: Leg[];
};

export const INDEX_BASKETS: IndexBasket[] = [
  {
    kind: "index",
    symbol: "MEGA7",
    name: "Megacap Seven",
    tags: ["Megacap", "Tech"],
    summary: "The seven largest US technology names in equal measure, so no single one decides the result.",
    about:
      "Megacap Seven holds the seven US companies that set the tone for the whole market, each at the same target weight. Equal weighting keeps the basket from turning into a bet on whichever name happens to be largest this quarter.",
    method: "Equal weight, reset to target whenever any leg drifts more than five points.",
    glyph: "grid",
    legs: [
      { symbol: "AAPL", weight: 14.3 },
      { symbol: "MSFT", weight: 14.3 },
      { symbol: "NVDA", weight: 14.3 },
      { symbol: "GOOGL", weight: 14.3 },
      { symbol: "AMZN", weight: 14.3 },
      { symbol: "META", weight: 14.3 },
      { symbol: "TSLA", weight: 14.2 },
    ],
  },
  {
    kind: "index",
    symbol: "SILICON",
    name: "Silicon Core",
    tags: ["AI", "Semiconductors"],
    summary: "Designers, foundries, memory and the machines that print the chips, weighted toward the leaders.",
    about:
      "Silicon Core follows the semiconductor chain end to end: the companies that design accelerators, the foundry that makes them, the memory they depend on and the lithography that makes all of it possible. Weights lean toward the largest names without letting any one pass thirty percent.",
    method: "Weighted by size with a 30% cap per leg, reviewed quarterly.",
    glyph: "chip",
    legs: [
      { symbol: "NVDA", weight: 30 },
      { symbol: "TSM", weight: 20 },
      { symbol: "AMD", weight: 15 },
      { symbol: "ASML", weight: 13 },
      { symbol: "MU", weight: 12 },
      { symbol: "INTC", weight: 10 },
    ],
  },
  {
    kind: "index",
    symbol: "COMPUTE",
    name: "Compute Landlords",
    tags: ["AI", "Cloud"],
    summary: "The companies that rent out the data-center capacity AI runs on.",
    about:
      "Compute Landlords owns the businesses that sell compute by the hour: specialist GPU clouds, the database and cloud incumbents, and the hardware vendor that racks the servers. It is exposure to AI demand without betting on which model wins.",
    method: "Fixed target weights, reviewed quarterly.",
    glyph: "server",
    legs: [
      { symbol: "ORCL", weight: 25 },
      { symbol: "CRWV", weight: 25 },
      { symbol: "NBIS", weight: 20 },
      { symbol: "MSFT", weight: 15 },
      { symbol: "DELL", weight: 15 },
    ],
  },
  {
    kind: "index",
    symbol: "ORBIT",
    name: "Orbit and Launch",
    tags: ["Space"],
    summary: "Launch providers and the companies building the economy above the atmosphere.",
    about: "Orbit and Launch pairs the largest private-to-public launch company with a dedicated small-launch and spacecraft maker. Two legs, deliberately concentrated.",
    method: "Fixed 60 / 40 target, reset monthly.",
    glyph: "orbit",
    legs: [
      { symbol: "SPCX", weight: 60 },
      { symbol: "RKLB", weight: 40 },
    ],
  },
  {
    kind: "index",
    symbol: "ONCHAIN",
    name: "On-Chain Equities",
    tags: ["Crypto", "Equities"],
    summary: "Listed companies whose revenue rises and falls with crypto activity.",
    about:
      "On-Chain Equities holds an exchange, a stablecoin issuer, a bitcoin treasury company and a miner. It gives crypto-linked exposure through regulated shares rather than through the coins themselves.",
    method: "Fixed target weights, reviewed quarterly.",
    glyph: "coin",
    legs: [
      { symbol: "COIN", weight: 35 },
      { symbol: "MSTR", weight: 30 },
      { symbol: "CRCL", weight: 20 },
      { symbol: "CLSK", weight: 15 },
    ],
  },
  {
    kind: "index",
    symbol: "HARD",
    name: "Hard Assets",
    tags: ["Commodities"],
    summary: "Gold, silver and oil through the listed funds that hold them.",
    about: "Hard Assets is a commodity sleeve: half gold, a third silver and the rest crude oil, each through a large listed fund tokenized on Robinhood Chain.",
    method: "Fixed 50 / 30 / 20 target, reset monthly.",
    glyph: "gold",
    legs: [
      { symbol: "GLD", weight: 50 },
      { symbol: "SLV", weight: 30 },
      { symbol: "USO", weight: 20 },
    ],
  },
  {
    kind: "index",
    symbol: "QUANTUM",
    name: "Quantum Bench",
    tags: ["Quantum"],
    summary: "Pure-play quantum computing companies, small and volatile by nature.",
    about: "Quantum Bench holds the two pure-play quantum hardware companies available as Stock Tokens. It is small, speculative and meant as a satellite position.",
    method: "Fixed 55 / 45 target, reset monthly.",
    glyph: "atom",
    legs: [
      { symbol: "IONQ", weight: 55 },
      { symbol: "RGTI", weight: 45 },
    ],
  },
  {
    kind: "index",
    symbol: "CORE",
    name: "Broad Market Core",
    tags: ["Index funds"],
    summary: "The S&P 500 and the Nasdaq-100, with a small international sleeve.",
    about: "Broad Market Core is the simplest possible foundation: the two most traded US index funds plus a country fund for a little diversification outside the US.",
    method: "Fixed 60 / 30 / 10 target, reset quarterly.",
    glyph: "bars",
    legs: [
      { symbol: "SPY", weight: 60 },
      { symbol: "QQQ", weight: 30 },
      { symbol: "EWY", weight: 10 },
    ],
  },
];

export const STRATEGY_GROUPS: StrategyGroup[] = ["Rule-based core", "AI and chips", "Energy and resources", "Sectors", "Crypto equities", "Yield and gold"];

export const STRATEGIES: StrategyBasket[] = [
  {
    kind: "automated",
    slug: "equal-weight-megacaps",
    name: "Equal Weight Megacaps",
    group: "Rule-based core",
    rule: "Equal weight",
    summary: "Ten large US companies at ten percent each, trimmed back whenever one runs ahead.",
    about: "The rule is the whole strategy: every leg starts at the same weight and is sold down or bought back to it on schedule. Winners fund laggards, which is a quiet way to take profit without deciding when.",
    rebalance: "Monthly, or when any leg drifts four points from target",
    glyph: "scale",
    legs: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "ORCL", "PLTR", "AMD"].map((symbol) => ({ symbol, weight: 10 })),
  },
  {
    kind: "automated",
    slug: "index-barbell",
    name: "Index Barbell",
    group: "Rule-based core",
    rule: "Barbell",
    summary: "Half in short-dated treasuries, half in the Nasdaq-100: steady on one side, growth on the other.",
    about: "A barbell keeps the two ends and skips the middle. One side earns the treasury rate with little price movement; the other carries the growth of the largest US technology companies.",
    rebalance: "Quarterly, back to 50 / 50",
    glyph: "layers",
    legs: [
      { symbol: "SGOV", weight: 50 },
      { symbol: "QQQ", weight: 50 },
    ],
  },
  {
    kind: "automated",
    slug: "pure-silicon",
    name: "Pure Silicon",
    group: "AI and chips",
    rule: "Capped size weight",
    summary: "Chip designers, foundry and memory, capped so the leader cannot dominate.",
    about: "Pure Silicon weights each semiconductor name by size and then caps every leg at twenty-five percent, spreading the excess over the rest.",
    rebalance: "Monthly",
    glyph: "chip",
    legs: [
      { symbol: "NVDA", weight: 25 },
      { symbol: "TSM", weight: 22 },
      { symbol: "AMD", weight: 16 },
      { symbol: "ASML", weight: 14 },
      { symbol: "MU", weight: 13 },
      { symbol: "INTC", weight: 10 },
    ],
  },
  {
    kind: "automated",
    slug: "quantum-leap",
    name: "Quantum Leap",
    group: "AI and chips",
    rule: "Equal weight",
    summary: "Quantum hardware next to the chipmakers most likely to supply it.",
    about: "Quantum Leap mixes the two pure-play quantum companies with the large chipmakers that fund most quantum research, so the basket is not only a lottery ticket.",
    rebalance: "Monthly",
    glyph: "atom",
    legs: [
      { symbol: "IONQ", weight: 25 },
      { symbol: "RGTI", weight: 25 },
      { symbol: "NVDA", weight: 25 },
      { symbol: "INTC", weight: 25 },
    ],
  },
  {
    kind: "automated",
    slug: "compute-grid",
    name: "Compute Grid",
    group: "AI and chips",
    rule: "Equal weight",
    summary: "GPU clouds, servers and storage: the physical layer of AI.",
    about: "Compute Grid buys the companies that turn chips into usable capacity, from specialist clouds to server and storage makers.",
    rebalance: "Monthly",
    glyph: "server",
    legs: [
      { symbol: "CRWV", weight: 20 },
      { symbol: "NBIS", weight: 20 },
      { symbol: "DELL", weight: 20 },
      { symbol: "SNDK", weight: 20 },
      { symbol: "ORCL", weight: 20 },
    ],
  },
  {
    kind: "automated",
    slug: "digital-fortress",
    name: "Digital Fortress",
    group: "Sectors",
    rule: "Equal weight",
    summary: "Data, analytics and platform software that governments and enterprises depend on.",
    about: "Digital Fortress holds software and platform companies with long contracts and sticky customers.",
    rebalance: "Quarterly",
    glyph: "shield",
    legs: [
      { symbol: "PLTR", weight: 25 },
      { symbol: "MSFT", weight: 25 },
      { symbol: "ORCL", weight: 25 },
      { symbol: "GOOGL", weight: 25 },
    ],
  },
  {
    kind: "automated",
    slug: "consumer-rails",
    name: "Consumer Rails",
    group: "Sectors",
    rule: "Equal weight",
    summary: "Where people shop, watch and play, from marketplaces to games.",
    about: "Consumer Rails follows spending: the largest online marketplace, the social platforms, the phone maker and a gaming retailer.",
    rebalance: "Quarterly",
    glyph: "grid",
    legs: [
      { symbol: "AMZN", weight: 25 },
      { symbol: "META", weight: 25 },
      { symbol: "AAPL", weight: 25 },
      { symbol: "GME", weight: 25 },
    ],
  },
  {
    kind: "automated",
    slug: "rare-earth-and-oil",
    name: "Rare Earth and Oil",
    group: "Energy and resources",
    rule: "Equal weight",
    summary: "Materials and energy that every factory and data center needs.",
    about: "Rare Earth and Oil combines a rare-earth miner, crude oil and silver, the inputs that sit underneath manufacturing.",
    rebalance: "Monthly",
    glyph: "pick",
    legs: [
      { symbol: "USAR", weight: 34 },
      { symbol: "USO", weight: 33 },
      { symbol: "SLV", weight: 33 },
    ],
  },
  {
    kind: "automated",
    slug: "power-and-launch",
    name: "Power and Launch",
    group: "Energy and resources",
    rule: "Equal weight",
    summary: "Energy and rockets: the heavy industry of the next decade.",
    about: "Power and Launch pairs crude oil with the two launch companies, a small bet that the physical economy keeps growing.",
    rebalance: "Monthly",
    glyph: "tower",
    legs: [
      { symbol: "USO", weight: 34 },
      { symbol: "SPCX", weight: 33 },
      { symbol: "RKLB", weight: 33 },
    ],
  },
  {
    kind: "automated",
    slug: "chain-revenue",
    name: "Chain Revenue",
    group: "Crypto equities",
    rule: "Equal weight",
    summary: "Listed companies that earn when on-chain activity rises.",
    about: "Chain Revenue holds exchanges, stablecoin issuance, treasury holders and mining in equal parts.",
    rebalance: "Monthly",
    glyph: "coin",
    legs: [
      { symbol: "COIN", weight: 25 },
      { symbol: "CRCL", weight: 25 },
      { symbol: "MSTR", weight: 25 },
      { symbol: "CLSK", weight: 25 },
    ],
  },
  {
    kind: "automated",
    slug: "treasury-anchor",
    name: "Treasury Anchor",
    group: "Yield and gold",
    rule: "Fixed target",
    summary: "Mostly short-dated treasuries with a gold sleeve for stress.",
    about: "Treasury Anchor is a parking place: four fifths in a 0-3 month treasury fund and one fifth in gold.",
    rebalance: "Quarterly",
    glyph: "wave",
    legs: [
      { symbol: "SGOV", weight: 80 },
      { symbol: "GLD", weight: 20 },
    ],
  },
  {
    kind: "automated",
    slug: "precious-metals",
    name: "Precious Metals",
    group: "Yield and gold",
    rule: "Fixed target",
    summary: "Gold and silver in a two-to-one split.",
    about: "Precious Metals holds precious metals through the two largest listed metal funds.",
    rebalance: "Quarterly",
    glyph: "gold",
    legs: [
      { symbol: "GLD", weight: 67 },
      { symbol: "SLV", weight: 33 },
    ],
  },
];

export const indexBySymbol = (s: string) => INDEX_BASKETS.find((b) => b.symbol.toLowerCase() === s.toLowerCase()) ?? null;
export const strategyBySlug = (s: string) => STRATEGIES.find((b) => b.slug === s) ?? null;
