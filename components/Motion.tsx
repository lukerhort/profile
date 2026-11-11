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
 *   data-orbit-spin="d" element rotates through d degrees while scrolling past
 *
 * With prefers-reduced-motion, Lenis is skipped and everything renders static.
 *
 * Reveal targets are only hidden by CSS until `motion-ready` lands on <html>
 * (see globals.css). It is added once the triggers below exist; if setup
 * throws, it is never added and the CSS failsafe un-hides everything.
 */
export default function Motion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const existing = new Set(ScrollTrigger.getAll());
        try {
          return setUpMotion();
        } catch (err) {
          // Leave the page static rather than half-animated: undo any inline
          // GSAP styles and let the CSS failsafe reveal everything.
          console.error("Motion setup failed; showing content without scroll effects.", err);
          ScrollTrigger.getAll().forEach((t) => existing.has(t) || t.kill());
          gsap.set("[data-reveal], [data-parallax], [data-orbit-spin]", { clearProps: "all" });
        }
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}

function setUpMotion() {
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

  // Orbit rings slowly precess as their section scrolls past.
  gsap.utils.toArray<HTMLElement>("[data-orbit-spin]").forEach((el) => {
    const amount = parseFloat(el.dataset.orbitSpin || "24");
    gsap.fromTo(
      el,
      { rotate: -amount / 2 },
      {
        rotate: amount / 2,
        ease: "none",
        scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });

  // Web fonts change text metrics; recompute trigger positions once they land.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  // Expanding a <details> changes page height; keep triggers below it accurate.
  const onToggle = () => ScrollTrigger.refresh();
  document.addEventListener("toggle", onToggle, true);

  // GSAP now holds every reveal target hidden inline until it scrolls
  // into view, so the CSS pre-hide and its failsafe can stand down.
  document.documentElement.classList.add("motion-ready");

  return () => {
    document.removeEventListener("toggle", onToggle, true);
    gsap.ticker.remove(raf);
    lenis.destroy();
  };
}
