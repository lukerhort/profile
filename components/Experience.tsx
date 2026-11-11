"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { experience } from "@/lib/content";
import SectionHeading from "./SectionHeading";
import { scramble, settle } from "./scramble";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Experience timeline. On large screens with motion allowed, the section pins
 * and scrolling advances through roles one at a time (masked slide, progress
 * rail with a crimson tick, a ghost index numeral, and the role title decoding
 * from glyphs). On mobile each title decodes once as its card reveals. With
 * reduced motion it is a plain stacked list.
 */
export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const n = experience.length;

  useGSAP(
    () => {
      const section = root.current!;
      const cards = gsap.utils.toArray<HTMLElement>("[data-exp-card]", section);
      const titles = cards.map((c) => c.querySelector<HTMLElement>("[data-scramble-host]")!);
      const railItems = gsap.utils.toArray<HTMLElement>("[data-exp-rail]", section);
      const counter = section.querySelector<HTMLElement>("[data-exp-counter]");
      const tick = section.querySelector<HTMLElement>("[data-exp-tick]")!;
      const ghost = section.querySelector<HTMLElement>("[data-exp-ghost]")!;
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        section.classList.add("exp-pinned");
        // Opacity, not autoAlpha: inactive roles stay in the accessibility tree.
        gsap.set(cards, { opacity: 0, pointerEvents: "none" });
        gsap.set(cards[0], { opacity: 1, y: 0, pointerEvents: "auto" });

        const HOLD = 0.5;
        const FADE = 0.5;
        const starts = cards.slice(1).map((_, i) => HOLD + i * (HOLD + FADE));
        const stage = section.querySelector<HTMLElement>(".exp-stage")!;
        const shift = () => stage.offsetHeight;

        // Crimson tick rides the rail to the active role.
        const tickY = (idx: number) => {
          const li = railItems[idx];
          return li.offsetTop + li.offsetHeight / 2;
        };
        gsap.set(tick, { y: tickY(0), autoAlpha: 1 });

        let current = 0;
        const setActive = (idx: number) => {
          if (idx === current) return;
          current = idx;
          railItems.forEach((el, i) => el.classList.toggle("is-active", i === idx));
          cards.forEach((c, i) => (c.style.pointerEvents = i === idx ? "auto" : "none"));
          if (counter) counter.textContent = pad(idx + 1);
          gsap.to(tick, { y: tickY(idx), duration: 0.45, ease: "expo.out", overwrite: true });
          ghost.dataset.n = pad(idx + 1);
          gsap.fromTo(ghost, { autoAlpha: 0, yPercent: 6 }, { autoAlpha: 1, yPercent: 0, duration: 0.7, ease: "expo.out", overwrite: true });
          titles.forEach((t, i) => (i === idx ? scramble(t) : settle(t)));
        };
        railItems[0].classList.add("is-active");

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${(n - 1) * window.innerHeight * 0.9}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefresh: () => gsap.set(tick, { y: tickY(current) }),
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
          tl.to(cards[i], { y: () => -shift(), opacity: 0, duration: FADE }, s).fromTo(
            cards[i + 1],
            { y: () => shift(), opacity: 0 },
            { y: 0, opacity: 1, duration: FADE },
            s,
          );
        });
        tl.to({}, { duration: HOLD }); // trailing hold on the last role
        tl.fromTo("[data-exp-fill]", { scaleY: 1 / n }, { scaleY: 1, ease: "none", duration: tl.duration() }, 0);

        return () => {
          section.classList.remove("exp-pinned");
          cards.forEach((c) => (c.style.pointerEvents = ""));
          railItems.forEach((el) => el.classList.remove("is-active"));
          titles.forEach(settle);
          ghost.dataset.n = "01";
        };
      });

      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card, i) =>
          gsap.fromTo(
            card,
            { opacity: 0, y: 48 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "expo.out",
              scrollTrigger: { trigger: card, start: "top 85%", once: true },
              onStart: () => scramble(titles[i], 0.6),
            },
          ),
        );
        return () => titles.forEach(settle);
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="experience"
      className="relative border-t border-line bg-ink py-28 lg:py-36"
    >
      {/* Ghost index numeral behind the active role (pinned mode only; drawn via CSS content). */}
      <div className="exp-ghost pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span data-exp-ghost data-n="01" className="exp-ghost-n" />
      </div>

      <div className="container-x relative grid gap-14 lg:grid-cols-12 lg:gap-12">
        {/* Left: heading, counter, progress rail */}
        <div className="lg:col-span-4">
          <SectionHeading index="02" label="Experience" title="Where I work" reveal={false} />
          <div className="exp-counter mt-10 items-end gap-3" aria-hidden="true">
            <span data-exp-counter className="display text-7xl text-fg">
              01
            </span>
            <span className="display pb-2 text-2xl text-muted">/ {pad(n)}</span>
          </div>
          <ol className="exp-rail relative mt-10 border-l border-line" aria-hidden="true">
            <span data-exp-fill className="absolute -left-px top-0 h-full w-px origin-top bg-accent" />
            <span data-exp-tick className="exp-tick" />
            {experience.map((r) => (
              <li
                key={r.title + r.dates}
                data-exp-rail
                className="py-2.5 pl-6 text-muted transition-colors duration-300 [&.is-active]:text-fg"
              >
                <span className="block font-mono text-[0.68rem] uppercase tracking-[0.2em]">{r.dates}</span>
                <span className="block text-sm">{r.org}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Right: role cards */}
        <div className="exp-stage space-y-16 lg:col-span-7 lg:col-start-6">
          {experience.map((r, i) => (
            <article
              key={r.title + r.dates}
              data-exp-card
              className="border-l border-line pl-6"
            >
              <p className="eyebrow flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-accent">{pad(i + 1)}</span>
                <span>{r.dates}</span>
                {r.type ? <span className="text-muted">{r.type}</span> : null}
              </p>
              <h3 data-scramble-host className="display relative mt-5 text-[clamp(2.25rem,5vw,4.75rem)]">
                <span data-scramble-src>{r.title}</span>
                <span data-scramble-fx aria-hidden="true" className="scramble-fx" />
              </h3>
              <p className="mt-3 text-lg text-fg/85 md:text-xl">
                {r.org}
                {r.location ? <span className="text-muted"> · {r.location}</span> : null}
              </p>
              <div className="mt-6 max-w-2xl space-y-4 leading-relaxed text-fg/65 md:text-lg">
                {r.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
