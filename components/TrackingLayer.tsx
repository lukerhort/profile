"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Shares HeroBackdrop's 1600x900 "slice" frame so the tracks sit concentric
// with the planet limb (planet centre at 800, 1640).
const CX = 800;
const CY = 1640;

const TRACKS = [
  { rx: 1540, ry: 985, tilt: 0, opacity: 0.12, dash: undefined },
  { rx: 1650, ry: 1085, tilt: -2.5, opacity: 0.09, dash: "2 8" },
  { rx: 1790, ry: 1195, tilt: 1.8, opacity: 0.1, dash: undefined },
  { rx: 1960, ry: 1330, tilt: -1.2, opacity: 0.07, dash: "2 8" },
];

// Orbital traffic: which track, start phase (0..1 across the visible arc), seconds per pass.
const OBJECTS = [
  { track: 0, phase: 0.1, period: 70, label: "OBJ-02" },
  { track: 0, phase: 0.62, period: 70 },
  { track: 1, phase: 0.35, period: 95 },
  { track: 2, phase: 0.8, period: 120, label: "OBJ-07" },
  { track: 2, phase: 0.18, period: 120 },
  { track: 3, phase: 0.5, period: 150 },
];

// Rotate/scale SVG groups about the target at (0, 0).
const ORIGIN = { transformBox: "view-box", transformOrigin: "0px 0px" } as const;

function arcWindow(rx: number) {
  const a = Math.asin(Math.min(1, 860 / rx));
  return [-Math.PI / 2 - a, -Math.PI / 2 + a] as const;
}

function pointOnTrack(trackIndex: number, f: number) {
  const t = TRACKS[trackIndex];
  const [lo, hi] = arcWindow(t.rx);
  const th = lo + f * (hi - lo);
  const x = t.rx * Math.cos(th);
  const y = t.ry * Math.sin(th);
  const r = (t.tilt * Math.PI) / 180;
  return { x: CX + x * Math.cos(r) - y * Math.sin(r), y: CY + x * Math.sin(r) + y * Math.cos(r) };
}

/** Orbital traffic moving along tracks above the planet limb. */
export function OrbitalTraffic() {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const nodes = gsap.utils.toArray<SVGGElement>("[data-obj]", root.current);
      const place = (time: number) =>
        nodes.forEach((node, i) => {
          const o = OBJECTS[i];
          const f = (((o.phase + time / o.period) % 1) + 1) % 1;
          const { x, y } = pointOnTrack(o.track, f);
          node.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
          // Fade in/out near the ends of the visible arc so wrap-around is invisible.
          node.setAttribute("opacity", Math.min(1, f * 8, (1 - f) * 8).toFixed(2));
        });

      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          place(0);
          if (ctx.conditions?.reduce) return;
          let visible = true;
          const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
          io.observe(root.current!);
          const t0 = gsap.ticker.time;
          const tick = (time: number) => {
            if (visible) place(time - t0);
          };
          gsap.ticker.add(tick);
          return () => {
            gsap.ticker.remove(tick);
            io.disconnect();
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <svg
      ref={root}
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {TRACKS.map((t, i) => (
        <ellipse
          key={i}
          cx={CX}
          cy={CY}
          rx={t.rx}
          ry={t.ry}
          transform={`rotate(${t.tilt} ${CX} ${CY})`}
          stroke="#fff"
          strokeOpacity={t.opacity}
          strokeDasharray={t.dash}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {OBJECTS.map((o, i) => (
        <g key={i} data-obj opacity="0">
          <rect x="-2.5" y="-2.5" width="5" height="5" fill="#fff" fillOpacity="0.85" />
          {o.label ? (
            <>
              <path d="M-9 -5 V-9 H-5 M5 -9 H9 V-5 M9 5 V9 H5 M-5 9 H-9 V5" stroke="#fff" strokeOpacity="0.55" />
              <text
                x="14"
                y="-8"
                fill="#fff"
                fillOpacity="0.45"
                fontSize="10"
                letterSpacing="1.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {o.label}
              </text>
            </>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

/**
 * Tracked object under a targeting reticle, with a second vehicle performing
 * proximity operations around it. Pure CSS/SVG animation.
 */
export function TrackReticle({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <div className="animate-[drift_14s_ease-in-out_infinite]">
        <svg viewBox="-120 -90 300 180" className="h-auto w-full overflow-visible" fill="none">
          {/* Reticle corners */}
          <g className="animate-[lock_4s_ease-in-out_infinite]" style={ORIGIN} stroke="#fff" strokeOpacity="0.85" strokeWidth="1.5">
            <path d="M-54 -34 V-54 H-34" />
            <path d="M34 -54 H54 V-34" />
            <path d="M54 34 V54 H34" />
            <path d="M-34 54 H-54 V34" />
          </g>
          {/* Crosshair ticks */}
          <g stroke="#fff" strokeOpacity="0.35">
            <path d="M0 -70 V-60 M0 60 V70 M-70 0 H-60 M60 0 H70" />
          </g>

          {/* Proximity-ops path + chaser vehicle */}
          <circle r="34" stroke="#cc0033" strokeOpacity="0.55" strokeDasharray="3 5" />
          <g className="animate-[circle_9s_linear_infinite]" style={ORIGIN}>
            <g transform="translate(34 0)">
              <circle r="7" stroke="#cc0033" strokeOpacity="0.5" />
              <rect x="-2.5" y="-2.5" width="5" height="5" fill="#cc0033" />
            </g>
          </g>

          {/* Target spacecraft: bus + solar arrays */}
          <g stroke="#fff" strokeOpacity="0.9">
            <rect x="-5" y="-5" width="10" height="10" fill="#050506" />
            <path d="M-5 0 H-10 M5 0 H10" />
            <rect x="-24" y="-4" width="14" height="8" fill="#fff" fillOpacity="0.08" />
            <rect x="10" y="-4" width="14" height="8" fill="#fff" fillOpacity="0.08" />
          </g>

          {/* Leader + label */}
          <path d="M54 -54 L78 -74 H176" stroke="#fff" strokeOpacity="0.35" />
          <g fill="#fff" fontSize="10" letterSpacing="2" style={{ fontFamily: "var(--font-mono)" }}>
            <text x="82" y="-80" fillOpacity="0.9">
              TRK-01
            </text>
            <text x="82" y="-60" fillOpacity="0.5">
              PROX OPS
            </text>
          </g>
          <circle cx="170" cy="-84" r="2.5" fill="#cc0033" className="animate-[blink_1.6s_steps(2)_infinite]" />
        </svg>
      </div>
    </div>
  );
}
