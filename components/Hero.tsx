"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { site } from "@/lib/content";

export type HeroMedia = {
  video?: string[]; // e.g. ["/media/hero.webm", "/media/hero.mp4"]
  poster?: string; // e.g. "/media/hero-poster.jpg"
};

export default function Hero({ media, backdrop }: { media: HeroMedia; backdrop: React.ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Intro
        gsap.fromTo(
          "[data-hero-in]",
          { autoAlpha: 0, yPercent: 60 },
          { autoAlpha: 1, yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.12, delay: 0.15 },
        );

        // Scroll-out: headline lifts and fades, background slowly pushes in.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        tl.to("[data-hero-copy]", { yPercent: -35, autoAlpha: 0, ease: "none" }, 0)
          .to("[data-hero-bg]", { scale: 1.15, ease: "none" }, 0)
          .to("[data-hero-shade]", { opacity: 1, ease: "none" }, 0);
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
      <div data-hero-shade className="pointer-events-none absolute inset-0 bg-ink opacity-0" />

      <div data-hero-copy className="container-x relative flex h-full flex-col justify-end pb-24 md:pb-28">
        <div className="overflow-hidden">
          <p data-hero-in className="eyebrow mb-5 text-fg/80">
            <span className="mr-3 inline-block h-2 w-2 bg-accent align-middle" aria-hidden="true" />
            {site.company} · {site.city}
          </p>
        </div>
        <h1 className="display text-[clamp(4.5rem,21vw,13rem)] md:text-[clamp(4.5rem,15vw,13rem)]">
          <span className="block overflow-hidden pb-[0.04em]">
            <span data-hero-in className="block">
              Luke
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.04em]">
            <span data-hero-in className="block">
              Horton
            </span>
          </span>
        </h1>
        <div className="overflow-hidden">
          <p data-hero-in className="display mt-4 text-2xl font-medium tracking-[0.2em] text-fg/85 md:text-4xl">
            {site.title}
          </p>
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
