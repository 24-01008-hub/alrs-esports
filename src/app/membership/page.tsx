import type { Metadata } from "next";
import { SITE_TITLES } from "@/lib/data";
import MembershipView from "@/components/views/MembershipView";

export const metadata: Metadata = { title: SITE_TITLES.membership };

export default function Page() {
  return (
  <MembershipView />
  );
}
