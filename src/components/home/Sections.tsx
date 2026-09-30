import Link from "next/link";
import { BRAND } from "@/config/brand";
import { assetBySymbol } from "@/config/assets";
import { Mark } from "@/components/Logo";
import { ArrowRight, CheckIcon, CloseIcon, XIcon } from "@/components/icons";
import { TokenLogo } from "@/components/ui/TokenLogo";

/* ------------------------------------------------------------------ */
/* Open infrastructure strip                                            */
/* ------------------------------------------------------------------ */

const INFRA = ["Robinhood Chain", "Uniswap", "Chainlink", "Blockscout", "Dexscreener", "WalletConnect", "EIP-6963 wallets", "USDG"];

function InfraGlyph({ i }: { i: number }) {
  const shapes = [
    <circle key="c" cx="12" cy="12" r="7" />,
    <rect key="r" x="5" y="5" width="14" height="14" rx="3" />,
    <path key="t" d="M12 4 20 19H4Z" />,
    <path key="d" d="M12 3 21 12 12 21 3 12Z" />,
  ];
  return (
    <span className="grid size-8 place-items-center rounded-[8px] bg-white/[0.07] text-ink-2">
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        {shapes[i % shapes.length]}
      </svg>
    </span>
  );
}

export function Infrastructure() {
  const list = [...INFRA, ...INFRA];
  return (
    <section className="py-16 sm:py-20">
      <h2 className="text-center text-[26px] font-medium tracking-[-0.02em] text-ink-2 sm:text-[32px]">Built on Open Infrastructure</h2>
      <div className="relative mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-14 pr-14">
          {list.map((name, i) => (
            <span key={name + i} className="flex shrink-0 items-center gap-3 text-[20px] font-medium text-ink sm:text-[22px]">
              <InfraGlyph i={i} />
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Baskets                                                              */
/* ------------------------------------------------------------------ */

const LEFT = ["SPY", "QQQ", "GLD", "SGOV", "EWY"];
const RIGHT = ["NVDA", "META", "GOOGL", "TSLA", "AAPL"];
const POS = [
  [9, 18],
  [26, 34],
  [9, 62],
  [28, 78],
  [22, 12],
];

function Hub() {
  const node = (sym: string, x: number, y: number, size: number) => (
    <span key={sym} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-night p-[6px] ring-1 ring-line-2" style={{ left: `${x}%`, top: `${y}%` }}>
      <TokenLogo src={assetBySymbol(sym)?.logo} symbol={sym} size={size} />
    </span>
  );
  const points = [...LEFT.map((s, i) => ({ s, x: POS[i][0], y: POS[i][1] })), ...RIGHT.map((s, i) => ({ s, x: 100 - POS[i][0], y: POS[i][1] }))];
  return (
    <div className="card relative mt-10 h-[420px] overflow-hidden sm:h-[520px]">
      <svg className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
        {points.map((p) => (
          <line key={p.s} x1="50" y1="46" x2={p.x} y2={p.y} stroke="rgba(127,176,156,0.35)" strokeWidth="0.15" strokeDasharray="0.8 0.8" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(96,145,126,0.22),transparent_40%)]" />
      {points.map((p, i) => node(p.s, p.x, p.y, i % 5 === 0 ? 44 : 34))}
      <span className="absolute left-1/2 top-[46%] grid size-[120px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-sage/60 bg-night shadow-[0_0_80px_rgba(96,145,126,0.35)] sm:size-[176px]">
        <Mark size={72} className="text-ink" />
      </span>
      <p className="absolute bottom-8 left-[18%] -translate-x-1/2 text-[12.5px] text-mute">Index baskets</p>
      <p className="absolute bottom-8 right-[18%] translate-x-1/2 text-[12.5px] text-mute">Tokenized pools</p>
    </div>
  );
}

function StrategyArt() {
  const bars = [38, 64, 52, 88, 70, 110, 96, 132];
  return (
    <svg viewBox="0 0 420 220" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sa" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fdfac3" stopOpacity="0.85" />
          <stop offset="1" stopColor="#60917e" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {bars.map((h, i) => (
        <rect key={i} x={24 + i * 48} y={200 - h} width="30" height={h} rx="4" fill="url(#sa)" opacity={0.35 + i * 0.08} />
      ))}
      <path d="M39 170 87 142 135 152 183 116 231 128 279 92 327 104 375 64" fill="none" stroke="#fdfac3" strokeWidth="2" />
      {[39, 87, 135, 183, 231, 279, 327, 375].map((x, i) => (
        <circle key={x} cx={x} cy={[170, 142, 152, 116, 128, 92, 104, 64][i]} r="3.5" fill="#000f06" stroke="#fdfac3" strokeWidth="1.5" />
      ))}
      <path d="M0 200h420" stroke="rgba(255,255,255,0.12)" />
    </svg>
  );
}

export function Baskets() {
  return (
    <section className="wrap-land pb-6 pt-20 sm:pt-28">
      <p className="eyebrow">Tokenized Baskets</p>
      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[640px]">
          <h2 className="h-sec">Own a Theme in One Order. Not Ten.</h2>
          <p className="lead mt-6">
            <b>Themed baskets</b> built only from verified stock tokens, each leg priced against its own oracle.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/rwa-baskets" className="btn btn-cream">
            Explore Baskets <ArrowRight className="size-3.5" />
          </Link>
          <Link href="/rwa-pools" className="btn btn-ghost">
            Tokenized Pools
          </Link>
        </div>
      </div>
      <Hub />
      <div className="card mt-5 grid grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="px-6 py-10 sm:px-12 sm:py-14">
          <p className="eyebrow">Strategy Baskets</p>
          <h3 className="mt-6 text-[32px] font-medium leading-[1.1] tracking-[-0.025em] sm:text-[40px]">Invest by Rule, Not by Rumor.</h3>
          <p className="lead mt-5 max-w-[480px]">
            <b>Rule-based strategies</b>: equal weight, momentum, low volatility and a treasury ladder. Every rule is written down before a single leg is bought.
          </p>
          <Link href="/rwa-baskets#automated" className="btn btn-cream mt-8">
            Explore Strategies <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="relative h-[240px] self-end px-6 pb-0 sm:h-[300px] lg:h-full lg:min-h-[340px]">
          <div className="absolute inset-x-6 bottom-0 top-8">
            <StrategyArt />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Lending and private settlement                                       */
/* ------------------------------------------------------------------ */

function SplitCard({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="card flex min-h-[320px] items-center justify-center px-5 py-10 sm:min-h-[400px] sm:px-10">{children}</div>
      <h3 className="h-card mt-8">{title}</h3>
      <p className="mt-3 max-w-[440px] text-[14px] leading-[1.6] text-ink-2">{body}</p>
    </div>
  );
}

function StepRow({ n, title, body, tone = "muted" }: { n: React.ReactNode; title: string; body: string; tone?: "muted" | "sage" | "cross" }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[10px] border border-line bg-white/[0.03] px-4 py-3">
      <span className={`grid size-7 shrink-0 place-items-center rounded-[6px] text-[13px] ${tone === "sage" ? "bg-sage text-night" : "bg-white/[0.07] text-ink-2"}`}>{n}</span>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium">{title}</span>
        <span className="block text-[12.5px] text-mute">{body}</span>
      </span>
    </div>
  );
}

export function Lending() {
  const groups: [string, string[]][] = [
    ["Stocks", ["NVDA", "SPCX", "CRCL", "META"]],
    ["Funds", ["SPY", "QQQ", "EWY", "SGOV"]],
    ["Metals", ["GLD", "SLV"]],
  ];
  return (
    <section className="wrap-land pb-6 pt-24 sm:pt-[150px]">
      <p className="flex items-center gap-3">
        <span className="eyebrow">Lending and Borrowing</span>
        <span className="tag-soon">Soon</span>
      </p>
      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[640px]">
          <h2 className="h-sec">Borrow Against What You Hold.</h2>
          <p className="lead mt-6">Stocks, funds and gold as collateral, valued at the oracle price. Keep the position, unlock the dollars.</p>
        </div>
        <a href={BRAND.x} target="_blank" rel="noreferrer" className="btn btn-ghost !h-10">
          <XIcon className="size-4" /> Follow for Launch
        </a>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-x-5 gap-y-16 lg:grid-cols-2">
        <SplitCard title="Borrow Without Selling" body="Deposit tokenized assets, borrow USDG against them and keep your exposure. Positions are valued at the oracle, not at a thin pool.">
          <div className="grid w-full max-w-[560px] gap-2.5">
            <StepRow n="1" title="Deposit collateral" body="Verified stock tokens, funds and gold" />
            <StepRow n="2" title="Borrow USDG" body="Up to a limit set per asset" />
            <StepRow n={<CheckIcon className="size-3.5" />} title="Keep the position" body="Your assets stay yours while you borrow" tone="sage" />
            <div className="flex gap-2 pt-2">
              <span className="chip">Self-custody</span>
              <span className="chip">Coming soon</span>
            </div>
          </div>
        </SplitCard>
        <SplitCard title="Collateral From Every Asset Class" body="The same verified assets you trade on Arbiter DEX, accepted as collateral when lending opens.">
          <div className="grid w-full max-w-[560px] gap-3 rounded-[12px] border border-line bg-night/60 p-5">
            {groups.map(([label, list]) => (
              <div key={label} className="flex flex-wrap items-center gap-2">
                <span className="chip chip-sage !h-[26px] !text-[12.5px]">{label}</span>
                {list.map((s) => (
                  <span key={s} className="flex h-[30px] items-center gap-1.5 rounded-[6px] bg-white/[0.06] pl-1.5 pr-2.5 text-[14px] font-medium">
                    <TokenLogo src={assetBySymbol(s)?.logo} symbol={s} size={20} />
                    {s}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </SplitCard>
      </div>
    </section>
  );
}

export function PrivateSettlement() {
  return (
    <section className="wrap-land pb-24 pt-24 sm:pb-[150px] sm:pt-[150px]">
      <p className="flex items-center gap-3">
        <span className="eyebrow">Private</span>
        <span className="tag-soon">Soon</span>
      </p>
      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[640px]">
          <h2 className="h-sec">Private Settlement</h2>
          <p className="lead mt-6">Move a position without tying the sending address to the receiving one, for the trades where discretion is worth the wait.</p>
        </div>
        <Link href="/private" className="btn btn-cream">
          Go Private
        </Link>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-x-5 gap-y-16 lg:grid-cols-2">
        <SplitCard title="No Line Between Sender and Receiver" body="Funds leave from your own address and arrive at a fresh one, with no on-chain path that links the two.">
          <div className="grid w-full max-w-[560px] gap-2.5">
            <StepRow n="1" title="You send from your own address" body="To a single-use deposit address" />
            <StepRow n="2" title="Settled through independent venues" body="The link between addresses is broken" />
            <StepRow n="3" title="Received at your new address" body="No on-chain trail back to the sender" tone="sage" />
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="chip">Verified assets only</span>
              <span className="chip">Slower than a swap</span>
            </div>
          </div>
        </SplitCard>
        <SplitCard title="Who It Is For" body="Larger moves where privacy matters more than speed.">
          <div className="grid w-full max-w-[560px] gap-2.5">
            <StepRow n={<CheckIcon className="size-3.5" />} title="Treasuries and teams" body="Pay people without publishing your balance sheet" tone="sage" />
            <StepRow n={<CheckIcon className="size-3.5" />} title="Large holders" body="Rebalance without announcing the next trade" tone="sage" />
            <StepRow n={<CheckIcon className="size-3.5" />} title="Everyday discretion" body="Keep holdings and history to yourself" tone="sage" />
            <StepRow n={<CloseIcon className="size-3.5" />} title="Not for fast trades" body="Settlement takes longer than a normal swap" />
          </div>
        </SplitCard>
      </div>
    </section>
  );
}
