import { LaunchpadHeader } from "@/components/launchpad/LaunchpadHeader";
import { LaunchpadFooter } from "@/components/launchpad/LaunchpadFooter";

export default function LaunchpadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LaunchpadHeader />
      <main className="min-h-[60vh]">{children}</main>
      <LaunchpadFooter />
    </>
  );
}
