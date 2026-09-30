import { BRAND } from "@/config/brand";

/* Site navigation, shared by the navbar menus, the phone drawer and the
   footer columns. `soon` items render as labelled, non-clickable rows. */

export type NavIcon =
  | "grid"
  | "bars"
  | "pie"
  | "gem"
  | "doc"
  | "bank"
  | "building"
  | "robot"
  | "stack"
  | "compass"
  | "briefcase"
  | "vault"
  | "rocket"
  | "pool"
  | "spark"
  | "percent"
  | "lend"
  | "multiply"
  | "swap"
  | "eye"
  | "search"
  | "bolt"
  | "cycle"
  | "trend"
  | "book"
  | "shield"
  | "fee"
  | "help";

export type NavItem = { label: string; href?: string; icon: NavIcon; soon?: boolean; divider?: boolean };
export type NavGroup = { label: string; href?: string; items?: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: "Markets",
    items: [
      { label: "All assets", href: "/assets", icon: "grid" },
      { label: "Stocks", href: "/assets?category=Stocks", icon: "bars" },
      { label: "ETFs and Index Funds", href: "/assets?category=ETFs", icon: "pie" },
      { label: "Commodities", href: "/assets?category=Commodities", icon: "gem" },
      { label: "Private Credit", href: "/assets?category=Private%20Credit", icon: "doc" },
      { label: "Treasuries", href: "/assets?category=Treasuries", icon: "bank" },
      { label: "Issuers", href: "/issuers", icon: "building", divider: true },
    ],
  },
  {
    label: "Baskets",
    items: [
      { label: "Automated Baskets", href: "/rwa-baskets#automated", icon: "robot" },
      { label: "Index Baskets", href: "/rwa-baskets#baskets", icon: "stack" },
      { label: "Discover all Baskets", href: "/rwa-baskets/discover", icon: "compass" },
      { label: "Managed Portfolios", icon: "briefcase", soon: true, divider: true },
      { label: "Vault Automation", icon: "vault", soon: true },
      { label: "Basket-Backed Launches", icon: "rocket", soon: true },
    ],
  },
  {
    label: "Earn",
    items: [
      { label: "Tokenized Pools", href: "/rwa-pools", icon: "pool" },
      { label: "Arbiter Pools", icon: "spark", soon: true },
      { label: "Asset Yield", icon: "percent", soon: true },
    ],
  },
  {
    label: "Lend and Borrow",
    items: [
      { label: "Lend and Borrow", href: "/lend", icon: "lend" },
      { label: "Multiply", href: "/lend?tab=multiply", icon: "multiply" },
    ],
  },
  {
    label: "Trade",
    items: [
      { label: "Swap and Bridge", href: "/swap", icon: "swap" },
      { label: "Private Swap", href: "/private", icon: "eye" },
    ],
  },
  {
    label: "Launchpad",
    items: [
      { label: "Launchpad", href: "/launchpad", icon: "rocket" },
      { label: "Explore tokens", href: "/launchpad/explore", icon: "search" },
      { label: "Create a token", href: "/launchpad/launch", icon: "bolt" },
      { label: "My tokens", href: "/launchpad/mine", icon: "briefcase" },
      { label: "Flywheel", href: "/launchpad/flywheel", icon: "cycle", divider: true },
      { label: BRAND.symbol, href: "/token", icon: "trend" },
      { label: "Launchpad Docs", href: "/launchpad/docs", icon: "book" },
    ],
  },
  { label: "Portfolio", href: "/portfolio" },
  {
    label: "Docs",
    items: [
      { label: "Overview", href: "/docs#overview", icon: "book" },
      { label: "Tokenized Baskets", href: "/docs#tokenized-baskets", icon: "stack" },
      { label: "Tokenized Pools", href: "/docs#tokenized-pools", icon: "pool" },
      { label: "Lend and Borrow", href: "/docs#lend-and-borrow", icon: "lend" },
      { label: "Fees", href: "/docs#fees", icon: "fee" },
      { label: "Safety", href: "/docs#safety", icon: "shield" },
      { label: "FAQ", href: "/docs#faq", icon: "help" },
    ],
  },
];

/** Footer columns: the same destinations, minus the "soon" rows. */
export const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Markets",
    links: [
      { label: "All assets", href: "/assets" },
      { label: "Stocks", href: "/assets?category=Stocks" },
      { label: "ETFs and Index Funds", href: "/assets?category=ETFs" },
      { label: "Commodities", href: "/assets?category=Commodities" },
      { label: "Private Credit", href: "/assets?category=Private%20Credit" },
      { label: "Treasuries", href: "/assets?category=Treasuries" },
      { label: "Issuers", href: "/issuers" },
    ],
  },
  {
    title: "Baskets",
    links: [
      { label: "Automated Baskets", href: "/rwa-baskets#automated" },
      { label: "Index Baskets", href: "/rwa-baskets#baskets" },
      { label: "Discover all Baskets", href: "/rwa-baskets/discover" },
    ],
  },
  { title: "Earn", links: [{ label: "Tokenized Pools", href: "/rwa-pools" }] },
  {
    title: "Lend and Borrow",
    links: [
      { label: "Lend and Borrow", href: "/lend" },
      { label: "Multiply", href: "/lend?tab=multiply" },
    ],
  },
  {
    title: "Trade",
    links: [
      { label: "Swap and Bridge", href: "/swap" },
      { label: "Private Swap", href: "/private" },
      { label: "Settlement Explorer", href: "/explorer" },
    ],
  },
  {
    title: "Launchpad",
    links: [
      { label: "Launchpad", href: "/launchpad" },
      { label: "Explore tokens", href: "/launchpad/explore" },
      { label: "Create a token", href: "/launchpad/launch" },
      { label: "My tokens", href: "/launchpad/mine" },
      { label: "Flywheel", href: "/launchpad/flywheel" },
      { label: BRAND.symbol, href: "/token" },
      { label: "Launchpad Docs", href: "/launchpad/docs" },
    ],
  },
  { title: "Resources", links: [{ label: "Docs", href: "/docs" }] },
];
