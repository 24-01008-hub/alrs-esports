import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_TITLES } from "@/lib/data";
import RosterView from "@/components/views/RosterView";

export const metadata: Metadata = { title: SITE_TITLES.roster };

export default function Page() {
  return (
  <Suspense fallback={null}>
    <RosterView />
  </Suspense>
  );
}
