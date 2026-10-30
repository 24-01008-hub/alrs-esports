import type { Metadata } from "next";
import { SITE_TITLES } from "@/lib/data";
import AboutView from "@/components/views/AboutView";

export const metadata: Metadata = { title: SITE_TITLES.about };

export default function Page() {
  return (
  <AboutView />
  );
}
