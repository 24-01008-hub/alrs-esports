import type { Metadata } from "next";
import { SITE_TITLES } from "@/lib/data";
import HomeView from "@/components/views/HomeView";

export const metadata: Metadata = { title: SITE_TITLES.home };

export default function HomePage() {
  return <HomeView />;
}
