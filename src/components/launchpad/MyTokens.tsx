"use client";

import Link from "next/link";
import { shortAddress } from "@/config/brand";
import { useWallet } from "@/components/wallet/WalletProvider";
import { ConnectButton } from "@/components/ui/ConnectButton";

/** The connected wallet's launches. None exist until the launchpad opens. */
export function MyTokens() {
  const { address } = useWallet();
  return (
    <div className="card mt-6 grid place-items-center px-6 py-14 text-center">
      {address ? (
        <>
          <p className="text-[19px] font-medium">No tokens launched from {shortAddress(address, 6, 4)} yet.</p>
          <p className="mt-2 max-w-[480px] text-[14.5px] leading-[1.6] text-mute">Launches are not open yet. Once they are, every token this wallet creates is listed here with its pool, fees collected and holders.</p>
          <Link href="/launchpad/launch" className="btn btn-cream mt-6">
            Draft your first token
          </Link>
        </>
      ) : (
        <>
          <p className="text-[19px] font-medium">Connect a wallet to see the tokens you created.</p>
          <ConnectButton className="btn btn-cream mt-5" />
        </>
      )}
    </div>
  );
}
