import type { Metadata } from "next";
import { SITE_TITLES } from "@/lib/data";
import MarketplaceView from "@/components/views/MarketplaceView";

export const metadata: Metadata = { title: SITE_TITLES.marketplace };

export default function Page() {
  return (
  <MarketplaceView />
  );
}
