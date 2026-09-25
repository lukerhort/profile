"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { deg, orbitState } from "@/lib/orbit";

gsap.registerPlugin(useGSAP);

// Orbit geometry (SVG units). The central body sits at the focus (0, 0).
const A = 250; // semi-major axis
const E = 0.5; // eccentricity
const B = A * Math.sqrt(1 - E * E);
const OMEGA = -18; // argument of periapsis (screen rotation, degrees)
const PERIOD = 26; // seconds per orbit
const ARC_R = 58; // radius of the ν angle arc

// A serif italic so the Greek nu doesn't read as a Latin "v".
const NU_FONT = { fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" } as const;

const rot = (x: number, y: number) => {
  const t = (OMEGA * Math.PI) / 180;
  return [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)] as const;
};

/**
 * Decorative orbit diagram: a satellite on a Keplerian ellipse (it speeds up
 * near periapsis), with the radius vector and true anomaly ν drawn live.
 */
export default function OrbitDiagram({ className = "" }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const sat = useRef<SVGGElement>(null);
  const radius = useRef<SVGLineElement>(null);
  const arc = useRef<SVGPathElement>(null);
  const nuLabel = useRef<SVGTextElement>(null);
  const readout = useRef<SVGTSpanElement>(null);

  useGSAP(
    () => {
      const draw = (fraction: number) => {
        const { x, y, nu } = orbitState(fraction, A, E);
        sat.current!.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        radius.current!.setAttribute("x2", x.toFixed(2));
        radius.current!.setAttribute("y2", y.toFixed(2));
        const ax = ARC_R * Math.cos(nu);
        const ay = ARC_R * Math.sin(nu);
        arc.current!.setAttribute(
          "d",
          `M ${ARC_R} 0 A ${ARC_R} ${ARC_R} 0 ${nu > Math.PI ? 1 : 0} 1 ${ax.toFixed(2)} ${ay.toFixed(2)}`,
        );
        const [lx, ly] = rot((ARC_R + 22) * Math.cos(nu / 2), (ARC_R + 22) * Math.sin(nu / 2));
        nuLabel.current!.setAttribute("x", lx.toFixed(1));
        nuLabel.current!.setAttribute("y", (ly + 5).toFixed(1));
        readout.current!.textContent = `${deg(nu).toFixed(1).padStart(5, "0")}°`;
      };

      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          if (ctx.conditions?.reduce) {
            draw(0.16);
            return;
          }
          let visible = true;
          const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
          io.observe(svg.current!);
          const start = gsap.ticker.time - 0.16 * PERIOD;
          const tick = (time: number) => {
            if (visible) draw((time - start) / PERIOD);
          };
          draw(0.16);
          gsap.ticker.add(tick);
          return () => {
            gsap.ticker.remove(tick);
            io.disconnect();
          };
        },
      );
    },
    { scope: svg },
  );

  const [periX, periY] = rot(A * (1 - E) - 6, 0);
  const [apoX, apoY] = rot(-A * (1 + E) + 6, 0);

  return (
    <svg
      ref={svg}
      className={className}
      viewBox="-430 -290 660 560"
      fill="none"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <g transform={`rotate(${OMEGA})`}>
        {/* Neighbouring orbits for depth */}
        <ellipse cx={-A * 0.25 * 0.2} cy="0" rx={A * 0.62} ry={A * 0.6} stroke="#fff" strokeOpacity="0.07" />
        <ellipse
          cx={-A * 1.3 * 0.62}
          cy="0"
          rx={A * 1.3}
          ry={A * 1.3 * Math.sqrt(1 - 0.62 * 0.62)}
          stroke="#fff"
          strokeOpacity="0.08"
          strokeDasharray="2 6"
          transform="rotate(34)"
        />

        {/* Line of apsides */}
        <line x1={-A * (1 + E)} y1="0" x2={A * (1 - E)} y2="0" stroke="#fff" strokeOpacity="0.14" strokeDasharray="3 5" />
        <line x1={A * (1 - E)} y1="-7" x2={A * (1 - E)} y2="7" stroke="#fff" strokeOpacity="0.5" />
        <line x1={-A * (1 + E)} y1="-7" x2={-A * (1 + E)} y2="7" stroke="#fff" strokeOpacity="0.5" />

        {/* Primary orbit */}
        <ellipse cx={-A * E} cy="0" rx={A} ry={B} stroke="#fff" strokeOpacity="0.32" />

        {/* Central body at the focus */}
        <circle r="24" stroke="#9fc0ff" strokeOpacity="0.18" />
        <circle r="15" fill="#0b1224" stroke="#b8d0ff" strokeOpacity="0.55" />

        {/* Radius vector + true anomaly arc */}
        <line ref={radius} x1="0" y1="0" x2={A * (1 - E)} y2="0" stroke="#fff" strokeOpacity="0.45" />
        <path ref={arc} stroke="#cc0033" strokeWidth="1.5" />

        {/* Spacecraft */}
        <g ref={sat} transform={`translate(${A * (1 - E)} 0)`}>
          <circle r="11" stroke="#cc0033" strokeOpacity="0.8" />
          <rect x="-3.5" y="-3.5" width="7" height="7" fill="#fff" transform="rotate(45)" />
        </g>
      </g>

      <g style={{ fontFamily: "var(--font-mono)" }} fontSize="11" letterSpacing="2.2" fill="#fff">
        <text ref={nuLabel} fill="#cc0033" fontSize="22" textAnchor="middle" letterSpacing="0" style={NU_FONT}>
          ν
        </text>
        <text x={periX} y={periY - 16} fillOpacity="0.5" textAnchor="end">
          PERIAPSIS
        </text>
        <text x={apoX} y={apoY - 16} fillOpacity="0.5">
          APOAPSIS
        </text>
        <text x="-420" y="-262" fillOpacity="0.45">
          TRUE ANOMALY
        </text>
        <text x="-420" y="-236" fontSize="20" letterSpacing="1.5" fillOpacity="0.9">
          <tspan style={NU_FONT} fontSize="24">
            ν
          </tspan>{" "}
          <tspan ref={readout}>000.0°</tspan>
        </text>
      </g>
    </svg>
  );
}
