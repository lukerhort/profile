"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Group = { group: string; items: string[] };

/**
 * "Systems schematic": skill groups as nodes on a hairline grid. From `sm` up
 * the nodes hang off a shared horizontal bus (one crimson trace across the
 * row, a junction dot above each node and a vertical drop down to it); on
 * phones the bus is omitted and each group is just a node and its chips, to
 * keep the layout compact.
 *
 * The server markup is the finished drawing (everything fully drawn), which
 * is what no-JS and reduced-motion visitors see. With motion allowed, on
 * scroll the bus draws left to right first, then the drops, then the nodes.
 */
export default function SkillsPanel({ groups }: { groups: Group[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = (sel: string) => gsap.utils.toArray<SVGElement>(sel, root.current);
        const bus = q("[data-bus]");
        const drops = q("[data-drop]");
        const joints = q("[data-joint]");
        const nodes = q("[data-node]");
        if (!nodes.length) return;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
        });
        // Segments run back to back with linear easing so they read as one trace.
        tl.fromTo(bus, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.26, ease: "none", stagger: 0.26 }, 0)
          .fromTo(joints, { opacity: 0 }, { opacity: 1, duration: 0.15, stagger: 0.26 }, 0.1)
          .fromTo(drops, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: "power2.out", stagger: 0.08 }, ">-0.05")
          .fromTo(nodes, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.4)", stagger: 0.08 }, "<0.2");
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
            className="schematic-cell border-b border-line px-4 pb-4 pt-3 last:border-b-0 sm:pt-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-b-0 sm:odd:border-r sm:odd:border-line lg:border-r lg:border-line lg:last:border-r-0 md:px-6 md:pb-7"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              className="schematic-svg -mx-4 block w-[calc(100%+2rem)] overflow-visible md:-mx-6 md:w-[calc(100%+3rem)]"
              fill="none"
            >
              {/* Bus segment: the cells' segments meet edge to edge to form one trace. */}
              <line data-bus className="schematic-trace schematic-bus" pathLength={1} x1="0" y1="10" x2="100%" y2="10" />
              <g className="schematic-anchor">
                <line data-drop className="schematic-trace schematic-bus" pathLength={1} x1="0" y1="10" x2="0" y2="26" />
                <circle data-joint className="schematic-joint schematic-bus" cx="0" cy="10" r="2.4" />
                <g className="schematic-node">
                  <g data-node>
                    <circle className="schematic-node-ring" cx="0" cy="0" r="6" />
                    <circle className="schematic-node-core" cx="0" cy="0" r="2.2" />
                  </g>
                </g>
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
