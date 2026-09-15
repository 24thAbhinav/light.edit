import type { Metadata } from "next";
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

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <Backdrop />
      <div className="relative z-10 flex flex-col">
        <SiteNav />
        <Hero />
        <div className="mx-auto w-full max-w-5xl px-6 pb-2 pt-16 sm:pt-20">
          <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-3 text-[12px] tracking-tight text-ink-faint">
            {CAPABILITIES.map((item) => (
              <span key={item}>{item}</span>
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
