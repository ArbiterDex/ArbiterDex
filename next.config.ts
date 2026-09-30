import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next writes agent instruction files at the repo root unless this is off.
  // The public repository carries no Markdown but its README.
  agentRules: false,
  async redirects() {
    // Short paths people type, pointed at the pages that answer them.
    return [
      { source: "/liquidity", destination: "/rwa-pools", permanent: false },
      { source: "/pools", destination: "/rwa-pools", permanent: false },
      { source: "/vaults", destination: "/rwa-baskets", permanent: false },
      { source: "/tokenized-baskets", destination: "/rwa-baskets", permanent: false },
      { source: "/trade", destination: "/swap", permanent: false },
    ];
  },
};

export default nextConfig;
