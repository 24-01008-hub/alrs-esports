import type { Metadata } from "next";
import { SITE_TITLES } from "@/lib/data";
import TournamentsView from "@/components/views/TournamentsView";

export const metadata: Metadata = { title: SITE_TITLES.tournaments };

export default function Page() {
  return (
  <TournamentsView />
  );
}
