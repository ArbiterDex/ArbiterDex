import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { indexBySymbol } from "@/config/baskets";
import { readMarket } from "@/lib/market-server";
import { BasketDetail } from "@/components/baskets/BasketDetail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ symbol: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = indexBySymbol((await params).symbol);
  return b ? { title: `${b.name} ($${b.symbol})`, description: b.summary } : { title: "Basket not found" };
}

export default async function IndexBasketPage({ params }: Props) {
  const basket = indexBySymbol((await params).symbol);
  if (!basket) notFound();
  return <BasketDetail basket={basket} market={await readMarket()} />;
}
