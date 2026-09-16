import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Backdrop } from "@/components/landing/backdrop";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNav } from "@/components/landing/site-nav";

export const metadata: Metadata = {
  title: "light.edit — Non-destructive photo editing",
  description:
    "Edit photos on the canvas with precise, non-destructive controls. Presets and guided lessons build on the same edits.",
};

const CAPABILITIES = [
  "Exposure",
  "Contrast",
  "Color",
  "Crop & rotate",
  "Presets",
  "Guided lessons",
];

const landingAccent = { "--accent": "var(--accent-brand)" } as CSSProperties;

export default function Home() {
  return (
    <main
      className="relative min-h-dvh overflow-hidden"
      style={landingAccent}
    >
      <Backdrop />
      <div className="relative z-10 flex flex-col">
        <SiteNav />
        <Hero />
        <div className="mt-20 border-y border-line/70 sm:mt-24">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5">
            {CAPABILITIES.map((item) => (
              <span
                key={item}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <HowItWorks />
        <FinalCta />
        <SiteFooter />
      </div>
    </main>
  );
}
