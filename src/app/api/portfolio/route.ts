import { NextResponse } from "next/server";
import { isAddress } from "@/config/brand";
import { readBalances } from "@/lib/chain-server";

export const dynamic = "force-dynamic";

/** Non-zero balances of every payable token for one wallet, in raw units. */
export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address") ?? "";
  if (!isAddress(address)) return NextResponse.json({ error: "Invalid address." }, { status: 400 });
  try {
    return NextResponse.json({ balances: await readBalances(address) });
  } catch {
    return NextResponse.json({ error: "Balances are unavailable right now." }, { status: 502 });
  }
}
