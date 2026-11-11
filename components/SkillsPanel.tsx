"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Group = { group: string; items: string[] };

/**
 * "Systems schematic": skill groups as nodes on a hairline grid, linked by 1px
 * crimson traces. The server markup is the finished drawing (traces fully
 * drawn); on scroll, with motion allowed, the traces draw in once.
 */
export default function SkillsPanel({ groups }: { groups: Group[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const traces = gsap.utils.toArray<SVGLineElement>("[data-trace]", root.current);
        const nodes = gsap.utils.toArray<SVGGElement>("[data-node]", root.current);
        if (!traces.length) return;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
        });
        tl.fromTo(
          traces,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut", stagger: 0.18 },
          0,
        );
        tl.fromTo(
          nodes,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: "power1.out", stagger: 0.18 },
          0,
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="schematic mt-14 md:mt-20" data-reveal>
      {(["tl", "tr", "bl", "br"] as const).map((p) => (
        <span key={p} className="schematic-corner" data-pos={p} aria-hidden="true" />
      ))}
      <div
        className="flex items-center justify-between border-b border-line px-4 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted md:px-6"
        aria-hidden="true"
      >
        <span>
          SYS.MAP<span className="hidden sm:inline"> // Capability schematic</span>
        </span>
        <span>{String(groups.length).padStart(2, "0")} nodes</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((g, i) => (
          <div
            key={g.group}
            className="[--pad:1rem] md:[--pad:1.5rem] border-b border-line px-4 pb-4 pt-3 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 sm:odd:border-r sm:odd:border-line lg:border-r lg:border-line lg:last:border-r-0 md:px-6 md:pb-7"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              className="-mx-4 block h-6 w-[calc(100%+2rem)] overflow-visible md:-mx-6 md:w-[calc(100%+3rem)]"
              fill="none"
            >
              <line
                data-trace
                className="schematic-trace"
                pathLength={1}
                x1="0"
                y1="12"
                x2="100%"
                y2="12"
              />
              <g data-node style={{ transform: "translate(calc(var(--pad) + 7px), 12px)" }}>
                <circle className="schematic-node-ring" cx="0" cy="0" r="6" />
                <circle className="schematic-node-core" cx="0" cy="0" r="2.2" />
              </g>
            </svg>
            <h3 className="eyebrow mt-1 flex items-baseline gap-3 text-fg">
              <span className="text-accent">N{i + 1}</span>
              {g.group}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-1.5 md:gap-2">
              {g.items.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
