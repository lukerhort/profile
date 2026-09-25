"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { experience } from "@/lib/content";
import SectionHeading from "./SectionHeading";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Experience timeline. On large screens with motion allowed, the section pins
 * and scrolling advances through roles one at a time (cross-fade + progress
 * rail). On mobile / reduced motion it is a plain stacked list.
 */
export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const n = experience.length;

  useGSAP(
    () => {
      const section = root.current!;
      const cards = gsap.utils.toArray<HTMLElement>("[data-exp-card]", section);
      const railItems = gsap.utils.toArray<HTMLElement>("[data-exp-rail]", section);
      const counter = section.querySelector<HTMLElement>("[data-exp-counter]");
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        section.classList.add("exp-pinned");
        gsap.set(cards, { autoAlpha: 0 });
        gsap.set(cards[0], { autoAlpha: 1, y: 0 });

        const HOLD = 0.5;
        const FADE = 0.5;
        const starts = cards.slice(1).map((_, i) => HOLD + i * (HOLD + FADE));
        const stage = section.querySelector<HTMLElement>(".exp-stage")!;
        const shift = () => stage.offsetHeight;

        const setActive = (idx: number) => {
          railItems.forEach((el, i) => el.classList.toggle("is-active", i === idx));
          if (counter) counter.textContent = String(idx + 1).padStart(2, "0");
        };
        setActive(0);

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${(n - 1) * window.innerHeight * 0.9}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const t = self.progress * tl.duration();
              const idx = starts.filter((s) => t > s + FADE / 2).length;
              setActive(idx);
            },
          },
        });

        // Masked vertical slide: the outgoing role exits upward as the next
        // enters from below, offset by the full stage height so the two never
        // overlap, even if scrolling stops mid-transition.
        starts.forEach((s, i) => {
          tl.to(cards[i], { y: () => -shift(), autoAlpha: 0, duration: FADE }, s).fromTo(
            cards[i + 1],
            { y: () => shift(), autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: FADE },
            s,
          );
        });
        tl.to({}, { duration: HOLD }); // trailing hold on the last role
        tl.fromTo("[data-exp-fill]", { scaleY: 1 / n }, { scaleY: 1, ease: "none", duration: tl.duration() }, 0);

        return () => {
          section.classList.remove("exp-pinned");
          railItems.forEach((el) => el.classList.remove("is-active"));
        };
      });

      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card) =>
          gsap.fromTo(
            card,
            { autoAlpha: 0, y: 48 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: "expo.out",
              scrollTrigger: { trigger: card, start: "top 85%", once: true },
            },
          ),
        );
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="experience"
      className="relative border-t border-line bg-ink py-28 lg:flex lg:h-svh lg:items-center lg:py-0"
    >
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-12">
        {/* Left: heading, counter, progress rail */}
        <div className="lg:col-span-4">
          <SectionHeading index="02" label="Experience" title="Where I work" reveal={false} />
          <div className="mt-10 hidden items-end gap-3 lg:flex" aria-hidden="true">
            <span data-exp-counter className="display text-7xl text-fg">
              01
            </span>
            <span className="display pb-2 text-2xl text-dim">/ {String(n).padStart(2, "0")}</span>
          </div>
          <ol className="relative mt-10 hidden border-l border-line lg:block" aria-hidden="true">
            <span data-exp-fill className="absolute -left-px top-0 h-full w-px origin-top bg-accent" />
            {experience.map((r) => (
              <li
                key={r.title + r.dates}
                data-exp-rail
                className="py-2.5 pl-6 text-dim transition-colors duration-300 [&.is-active]:text-fg"
              >
                <span className="block font-mono text-[0.68rem] uppercase tracking-[0.2em]">{r.dates}</span>
                <span className="block text-sm">{r.org}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Right: role cards */}
        <div className="exp-stage space-y-16 lg:col-span-7 lg:col-start-6 lg:space-y-0 lg:self-center">
          {experience.map((r, i) => (
            <article
              key={r.title + r.dates}
              data-exp-card
              className="border-l border-line pl-6 lg:self-center lg:border-0 lg:pl-0"
            >
              <p className="eyebrow flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span>{r.dates}</span>
                {r.type ? <span className="text-dim">{r.type}</span> : null}
              </p>
              <h3 className="display mt-5 text-[clamp(2.25rem,5vw,4.75rem)]">{r.title}</h3>
              <p className="mt-3 text-lg text-fg/85 md:text-xl">
                {r.org}
                {r.location ? <span className="text-muted"> · {r.location}</span> : null}
              </p>
              <div className="mt-6 max-w-2xl space-y-4 leading-relaxed text-fg/65 md:text-lg">
                {r.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {r.todo && process.env.NODE_ENV !== "production" ? (
                <p className="todo mt-5">TODO (dev only): {r.todo}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
