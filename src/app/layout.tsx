import type { Metadata, Viewport } from "next";
import { Geist, Michroma, Source_Code_Pro } from "next/font/google";
import { BRAND } from "@/config/brand";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { WalletModalProvider } from "@/components/wallet/WalletButton";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const sourceCode = Source_Code_Pro({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-source-code", display: "swap" });
const michroma = Michroma({ subsets: ["latin"], weight: "400", variable: "--font-michroma", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: { default: `${BRAND.name} · ${BRAND.tagline}`, template: `%s · ${BRAND.name}` },
  description: BRAND.description,
  openGraph: { title: `${BRAND.name} · ${BRAND.slogan}`, description: BRAND.description, url: BRAND.url, siteName: BRAND.name, type: "website" },
  twitter: { card: "summary_large_image", title: `${BRAND.name} · ${BRAND.slogan}`, description: BRAND.description, site: BRAND.xHandle },
};

export const viewport: Viewport = {
  themeColor: "#000f06",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${sourceCode.variable} ${michroma.variable}`}>
      <body>
        <WalletProvider>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
