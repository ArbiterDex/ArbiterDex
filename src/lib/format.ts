/** Number formatting shared by every page. Amounts are never rounded up. */

export function usd(value: number, digits = 2) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Price with sensible precision for anything from $0.0004 to $4,000. */
export function price(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  if (value >= 1000) return usd(value, 2);
  if (value >= 1) return usd(value, 2);
  if (value >= 0.01) return usd(value, 4);
  return `$${value.toPrecision(3)}`;
}

/** $4.9M, $184.1K, $23M. */
export function compact(value: number | null | undefined, prefix = "$") {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const fmt = (n: number, unit: string) => `${prefix}${n.toFixed(n >= 100 ? 0 : 1).replace(/\.0$/, "")}${unit}`;
  if (abs >= 1e9) return fmt(value / 1e9, "B");
  if (abs >= 1e6) return fmt(value / 1e6, "M");
  if (abs >= 1e3) return fmt(value / 1e3, "K");
  return `${prefix}${value.toFixed(value >= 10 ? 0 : 2)}`;
}

export function pct(value: number | null | undefined, digits = 2, signed = true) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const s = value.toFixed(digits);
  return signed && value > 0 ? `+${s}%` : `${s}%`;
}

/** Basis points as a signed percentage, e.g. +0.18%. */
export const bps = (value: number | null | undefined) => (value === null || value === undefined ? "—" : pct(value / 100, 2));

export function count(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

/** Raw integer amount (as string or bigint) to a decimal string, trimmed. */
export function units(raw: string | bigint, decimals: number, maxFraction = 6) {
  const value = typeof raw === "bigint" ? raw : BigInt(raw);
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const fraction = (abs % base).toString().padStart(decimals, "0").slice(0, maxFraction).replace(/0+$/, "");
  return `${negative ? "-" : ""}${fraction ? `${whole}.${fraction}` : whole}`;
}

/** Significant-figure display for token amounts, e.g. 0.02339. */
export function tokenAmount(value: number) {
  if (!Number.isFinite(value) || value === 0) return "0";
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return value.toPrecision(4).replace(/0+$/, "").replace(/\.$/, "");
}

/** Parses a decimal string into integer units without floating point. */
export function parseUnits(value: string, decimals: number): bigint | null {
  if (!/^\d+(\.\d*)?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole + fraction.slice(0, decimals).padEnd(decimals, "0"));
}

/** "3 min ago" style relative time from unix seconds. */
export function ago(unixSeconds: number, now = Date.now()) {
  const s = Math.max(0, Math.round(now / 1000 - unixSeconds));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
