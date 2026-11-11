"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { site } from "@/lib/content";
import { OrbitalTraffic, TrackReticle } from "./TrackingLayer";

export type HeroMedia = {
  video?: string[]; // e.g. ["/media/hero.webm", "/media/hero.mp4"]
  poster?: string; // e.g. "/media/hero-poster.jpg"
};

export default function Hero({ media, backdrop }: { media: HeroMedia; backdrop: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // The intro is a CSS animation (see [data-hero-in] in globals.css) so the
      // hero never depends on this bundle to become visible.
      const mm = gsap.matchMedia();
      mm.add(
        "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) and (min-width: 768px)",
        () => {
          // Depth: far layer (sky) and near layer (orbits, tracker) shift by
          // different amounts as the cursor moves.
          const bx = gsap.quickTo("[data-hero-bg]", "x", { duration: 1.4, ease: "power3.out" });
          const by = gsap.quickTo("[data-hero-bg]", "y", { duration: 1.4, ease: "power3.out" });
          const ox = gsap.quickTo("[data-hero-orbit]", "x", { duration: 1.4, ease: "power3.out" });
          const oy = gsap.quickTo("[data-hero-orbit]", "y", { duration: 1.4, ease: "power3.out" });
          const section = root.current!;
          const onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            bx(nx * -10);
            by(ny * -6);
            ox(nx * -22);
            oy(ny * -12);
          };
          section.addEventListener("pointermove", onMove);
          return () => section.removeEventListener("pointermove", onMove);
        },
      );
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Scroll-out: headline lifts and fades, background slowly pushes in.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        // Opacity (not autoAlpha) so the hero links stay reachable with Shift+Tab.
        tl.to("[data-hero-copy]", { yPercent: -35, opacity: 0, ease: "none" }, 0)
          .to("[data-hero-bg]", { scale: 1.15, ease: "none" }, 0)
          .to("[data-hero-shade]", { opacity: 1, ease: "none" }, 0)
          .to("[data-hero-orbit]", { yPercent: -12, ease: "none" }, 0);

        // One-off acquisition sweep ~1.2 s after load. Only JS starts it, so
        // without JS (or with reduced motion) the scan line never shows.
        const scan = root.current!.querySelector<HTMLElement>("[data-hero-scan]")!;
        const done = () => scan.classList.remove("is-scanning");
        scan.addEventListener("animationend", done);
        const start = gsap.delayedCall(Math.max(0.05, 1.2 - performance.now() / 1000), () =>
          scan.classList.add("is-scanning"),
        );
        return () => {
          start.kill();
          scan.removeEventListener("animationend", done);
          done();
        };
      });
    },
    { scope: root },
  );

  const hasVideo = !!media.video?.length;

  return (
    <section ref={root} id="top" className="relative h-svh min-h-[560px] overflow-hidden">
      <div data-hero-bg className="absolute inset-0 will-change-transform">
        {hasVideo ? (
          <video
            className="h-full w-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={media.poster}
            aria-hidden="true"
          >
            {media.video!.map((src) => (
              <source key={src} src={src} type={src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
            ))}
          </video>
        ) : null}
        {media.poster ? (
          <img
            src={media.poster}
            alt=""
            fetchPriority="high"
            className={`h-full w-full object-cover ${hasVideo ? "hidden motion-reduce:block" : ""}`}
          />
        ) : null}
        {!hasVideo && !media.poster ? backdrop : null}
      </div>

      {/* Legibility gradients */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/60 via-transparent to-ink" />

      {/* Orbital traffic + tracked object (sit above any hero media) */}
      <div data-hero-orbit className="pointer-events-none absolute inset-0">
        <OrbitalTraffic />
        <TrackReticle className="absolute left-[28%] top-[8%] w-[220px] md:left-auto md:right-[9%] md:top-[18%] md:w-[min(30vw,420px)]" />
      </div>

      {/* One-off acquisition sweep: started by JS (never shown without JS or with reduced motion) */}
      <div data-hero-scan className="hero-scan pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span className="hero-scan-beam" />
      </div>

      <div data-hero-shade className="pointer-events-none absolute inset-0 bg-ink opacity-0" />

      <div data-hero-copy className="container-x relative flex h-full flex-col justify-end pb-24 md:pb-28">
        <div className="overflow-hidden">
          <p data-hero-in style={{ "--hero-i": 0 } as React.CSSProperties} className="eyebrow mb-5 text-fg/80">
            <span className="mr-3 inline-block h-2 w-2 bg-accent align-middle" aria-hidden="true" />
            {site.company} · {site.city}
          </p>
        </div>
        <h1 className="display text-[clamp(4.5rem,21vw,13rem)] md:text-[clamp(4.5rem,15vw,13rem)]">
          <span className="block overflow-hidden pb-[0.04em]">
            <span data-hero-in style={{ "--hero-i": 1 } as React.CSSProperties} className="block">
              Luke
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.04em]">
            <span data-hero-in style={{ "--hero-i": 2 } as React.CSSProperties} className="block">
              Horton
            </span>
          </span>
        </h1>
        <div className="overflow-hidden">
          <p
            data-hero-in
            style={{ "--hero-i": 3 } as React.CSSProperties}
            className="display mt-4 text-[1.4rem] font-medium leading-[1.1] tracking-[0.16em] text-fg/85 sm:text-2xl md:text-3xl lg:text-[2.15rem]"
          >
            {/* "Electrical Engineer I, Systems": breaks after the comma when a phone is too narrow for one line. */}
            {site.title.split(/(?<=,) /).map((part) => (
              <span key={part} className="inline-block">
                {part}&nbsp;
              </span>
            ))}
          </p>
        </div>
        <p
          data-hero-in
          style={{ "--hero-i": 4 } as React.CSSProperties}
          className="mt-5 max-w-[34ch] text-base leading-snug text-fg/70 md:text-lg"
        >
          {site.tagline}
        </p>
        <div data-hero-in style={{ "--hero-i": 5 } as React.CSSProperties} className="mt-7 flex flex-wrap gap-3">
          <a
            href={site.resume}
            target="_blank"
            rel="noopener"
            className="btn-line btn-accent"
            data-testid="hero-cta-resume"
          >
            Resume · {site.resumeDate} <span aria-hidden="true">↗</span>
          </a>
          <a href="#contact" className="btn-line" data-testid="hero-cta-contact">
            Contact
          </a>
        </div>
      </div>

      <a
        href="#about"
        className="eyebrow absolute bottom-8 right-5 flex items-center gap-3 text-fg/60 transition-colors hover:text-fg md:right-12"
      >
        Scroll
        <span className="relative block h-10 w-px overflow-hidden bg-fg/20">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_ease-in-out_infinite] bg-fg" />
        </span>
      </a>
    </section>
  );
}
