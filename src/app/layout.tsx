/* ==========================================================================
   ALRS · Root layout — fonts, shell chrome, providers
   ========================================================================== */

import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/ui/Providers";
import Preloader from "@/components/Preloader";
import Background from "@/components/Background";
import RouteEnhancer from "@/components/RouteEnhancer";
import Header from "@/components/Header";
import Drawer from "@/components/Drawer";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import { getContent } from "@/lib/content";
import { THEME_INIT } from "@/lib/theme";

const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ALRS — Alangilan Red Spartans Esports | Batangas State University",
    template: "%s",
  },
  description:
    "The official digital home of the Alangilan Red Spartans Esports (ALRS) — Batangas State University, The National Engineering University, Alangilan Campus. Membership, rosters, tournaments, sponsor perks and the Spartan community.",
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: "ALRS — Alangilan Red Spartans Esports",
    description:
      "Compete. Represent. Belong. The official membership platform of the Red Spartans of BatStateU Alangilan.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#06060A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="onyx"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <Providers content={getContent()}>
          <Preloader />
          <Background />
          <RouteEnhancer />
          <Header />
          <Drawer />
          <main id="view" className="view-root" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <CommandPalette />
        </Providers>
      </body>
    </html>
  );
}
