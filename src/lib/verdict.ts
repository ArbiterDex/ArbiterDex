/* The arbiter's ruling on a quote: how far the best executable output sits
   from the output an independent oracle says is fair. Shared by server and UI. */

export type Ruling = "fair" | "watch" | "unfair" | "unknown";

export const RULING_TEXT: Record<Ruling, { title: string; body: string }> = {
  fair: { title: "Fair", body: "The best route is within 0.5% of the oracle's fair value." },
  watch: { title: "Within tolerance", body: "The best route gives up 0.5% to 1.5% against the oracle. Smaller orders usually fare better." },
  unfair: { title: "Unfair right now", body: "Every route gives up more than 1.5% against the oracle. Wait, trade smaller, or accept it knowingly." },
  unknown: { title: "No oracle reference", body: "One side has no independent price feed, so only venue prices were compared." },
};

/** Edge in basis points: positive means the route pays more than fair value. */
export function rule(edgeBps: number | null): Ruling {
  if (edgeBps === null || !Number.isFinite(edgeBps)) return "unknown";
  if (edgeBps >= -50) return "fair";
  if (edgeBps >= -150) return "watch";
  return "unfair";
}
