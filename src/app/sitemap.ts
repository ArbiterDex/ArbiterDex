import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

const ROUTES = [
  "",
  "/swap",
  "/private",
  "/assets",
  "/issuers",
  "/rwa-baskets",
  "/rwa-baskets/discover",
  "/rwa-pools",
  "/lend",
  "/portfolio",
  "/explorer",
  "/launchpad",
  "/launchpad/explore",
  "/launchpad/launch",
  "/launchpad/flywheel",
  "/launchpad/docs",
  "/token",
  "/arbiter",
  "/docs",
  "/terms",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({ url: `${BRAND.url}${r}`, changeFrequency: "daily", priority: r === "" ? 1 : 0.6 }));
}
