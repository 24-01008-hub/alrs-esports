import type { Metadata } from "next";
import { SITE_TITLES } from "@/lib/data";
import DashboardView from "@/components/views/DashboardView";

export const metadata: Metadata = { title: SITE_TITLES.dashboard };

export default function Page() {
  return (
  <DashboardView />
  );
}
