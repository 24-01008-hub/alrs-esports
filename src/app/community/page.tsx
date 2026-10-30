import type { Metadata } from "next";
import { SITE_TITLES } from "@/lib/data";
import CommunityView from "@/components/views/CommunityView";

export const metadata: Metadata = { title: SITE_TITLES.community };

export default function Page() {
  return (
  <CommunityView />
  );
}
