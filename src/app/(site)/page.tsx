import { Hero, LaunchToast } from "@/components/home/Hero";
import { Starfield } from "@/components/home/Starfield";
import { Features } from "@/components/home/Features";
import { Baskets, Infrastructure, Lending, PrivateSettlement } from "@/components/home/Sections";

// The venue card reads live prices on every request.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Starfield />
      <Features />
      <Infrastructure />
      <Baskets />
      <Lending />
      <PrivateSettlement />
      <LaunchToast />
    </>
  );
}
