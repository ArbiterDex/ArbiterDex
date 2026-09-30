import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { strategyBySlug } from "@/config/baskets";
import { readMarket } from "@/lib/market-server";
import { BasketDetail } from "@/components/baskets/BasketDetail";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = strategyBySlug((await params).slug);
  return b ? { title: b.name, description: b.summary } : { title: "Strategy not found" };
}

export default async function AutomatedBasketPage({ params }: Props) {
  const basket = strategyBySlug((await params).slug);
  if (!basket) notFound();
  return <BasketDetail basket={basket} market={await readMarket()} />;
}
