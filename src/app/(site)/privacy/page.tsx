import type { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="30 September 2026"
      intro={`${BRAND.name} is built to need as little about you as possible. This page lists what the site touches and why.`}
      sections={[
        { heading: "No accounts", body: "There is no sign-up, no email and no identity check. Your wallet address is the only identifier the site ever sees." },
        {
          heading: "What your browser stores",
          list: ["The wallet you last connected and its address, kept in your browser's local storage so you stay connected.", "Nothing else is stored about you. Clearing site data removes it."],
        },
        {
          heading: "What the server reads",
          list: [
            "When you view balances or ask for a quote, the server reads public blockchain data for the address or amount you chose.",
            "Those reads go to public RPC endpoints, Chainlink feeds and the Dexscreener API. They receive the request, not your identity.",
            "Standard hosting logs (IP address, time, page) may be kept briefly by the hosting provider for security.",
          ],
        },
        { heading: "Public blockchain data", body: "Anything you sign is recorded on a public blockchain by design. The site cannot hide or delete it." },
        { heading: "Wallet connections", body: "Browser wallets and WalletConnect handle your keys under their own policies. The site never receives a private key or seed phrase." },
        { heading: "Contact", body: `Questions can be sent on X to ${BRAND.xHandle}.` },
      ]}
    />
  );
}
