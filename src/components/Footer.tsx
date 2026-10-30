"use client";

/* ==========================================================================
   ALRS · Footer — brand, link columns, Spartan Signal newsletter
   ========================================================================== */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useContent, useUI } from "./ui/ui-context";
import { BrandMark } from "@/lib/brand";

export default function Footer() {
  const content = useContent();
  const { toast } = useUI();
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const onNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input");
    const v = (input?.value ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      toast("Check your email", "That address does not look valid.", "gold");
      return;
    }
    if (input) input.value = "";
    toast("Subscribed", "Spartan Signal is on its way to your inbox.", "ok");
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="brand brand--footer">
              <span className="brand__mark">
                <BrandMark logo={content.uploads.logo} />
              </span>
              <span className="brand__text">
                <strong>ALRS</strong>
                <small>Alangilan Red Spartans Esports</small>
              </span>
            </div>
            <p>
              The official student esports organization of Batangas State University —
              The National Engineering University, Alangilan Campus. Building
              competitors, creators and leaders since {content.brand.founded}.
            </p>
            <div className="footer__social">
              {content.socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  title={s.label}
                >
                  {s.icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="footer__col">
            <h5>Organization</h5>
            <Link href="/about">About ALRS</Link>
            <Link href="/roster">Teams &amp; Roster</Link>
            <Link href="/tournaments">Events board</Link>
            <Link href="/community">Community Hub</Link>
          </div>

          <div className="footer__col">
            <h5>Membership</h5>
            <Link href="/membership">Tiers &amp; Perks</Link>
            <Link href="/membership">Enroll now</Link>
            <Link href="/dashboard">Member dashboard</Link>
            <Link href="/marketplace">Redeem marketplace</Link>
          </div>

          <div className="footer__col footer__col--news">
            <h5>Spartan Signal</h5>
            <p className="muted">
              Match alerts, tryout calls and member-only drops. No spam.
            </p>
            <form className="newsletter" onSubmit={onNewsletter} noValidate>
              <input
                type="email"
                name="email"
                placeholder="you@batstate-u.edu.ph"
                aria-label="Email address"
                required
              />
              <button className="btn btn--primary btn--sm" type="submit">
                Subscribe
              </button>
            </form>
            <div className="footer__badges">
              <span className="chip chip--gold">Official Org</span>
              <span className="chip">Student-Led</span>
              <span className="chip">EST. {content.brand.founded}</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="mono" suppressHydrationWarning>
            © {year} ALRS · Batangas State University
          </span>
          <span className="mono muted">MOLON LABE · WE DO NOT RETREAT</span>
          <div className="footer__legal">
            <Link href="/about">Conduct</Link>
            <Link href="/about">Privacy</Link>
            <Link href="/about">Terms</Link>
          </div>
        </div>
      </div>
      <div className="footer__strip" />
    </footer>
  );
}
