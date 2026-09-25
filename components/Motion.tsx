"use client";

import { useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Wraps the page with Lenis smooth scrolling (driven by GSAP's ticker so it
 * stays in sync with ScrollTrigger) and wires up declarative scroll effects:
 *
 *   data-reveal-group   container whose [data-reveal] children stagger in
 *   data-reveal         element that fades/slides up when scrolled into view
 *   data-parallax="n"   element drifts by n * 100% of its height while scrolling
 *
 * With prefers-reduced-motion, Lenis is skipped and everything renders static.
 */
export default function Motion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const lenis = new Lenis({ autoRaf: false, anchors: true });
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        // Staggered reveals, grouped so siblings cascade together.
        const grouped = new Set<Element>();
        gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
          const items = group.querySelectorAll<HTMLElement>("[data-reveal]");
          items.forEach((el) => grouped.add(el));
          gsap.fromTo(
            items,
            { autoAlpha: 0, y: 48 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.09,
              scrollTrigger: { trigger: group, start: "top 82%", once: true },
            },
          );
        });
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          if (grouped.has(el)) return;
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 48 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const amount = parseFloat(el.dataset.parallax || "0.15");
          gsap.fromTo(
            el,
            { yPercent: -amount * 50 },
            {
              yPercent: amount * 50,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        // Web fonts change text metrics; recompute trigger positions once they land.
        document.fonts?.ready.then(() => ScrollTrigger.refresh());

        // Expanding a <details> changes page height; keep triggers below it accurate.
        const onToggle = () => ScrollTrigger.refresh();
        document.addEventListener("toggle", onToggle, true);

        return () => {
          document.removeEventListener("toggle", onToggle, true);
          gsap.ticker.remove(raf);
          lenis.destroy();
        };
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
