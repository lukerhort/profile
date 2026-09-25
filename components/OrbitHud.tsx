"use client";

import { useEffect, useRef } from "react";
import { deg, orbitState } from "@/lib/orbit";

const A = 17;
const E = 0.45;
const B = A * Math.sqrt(1 - E * E);

/**
 * Fixed scroll indicator: scrolling the page flies one orbit, and the readout
 * shows the spacecraft's true anomaly ν. Desktop only.
 */
export default function OrbitHud() {
  const sat = useRef<SVGCircleElement>(null);
  const vec = useRef<SVGLineElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 0.9999) : 0;
      const { x, y, nu } = orbitState(p, A, E);
      sat.current?.setAttribute("cx", x.toFixed(2));
      sat.current?.setAttribute("cy", y.toFixed(2));
      vec.current?.setAttribute("x2", x.toFixed(2));
      vec.current?.setAttribute("y2", y.toFixed(2));
      if (label.current) label.current.textContent = `${deg(nu).toFixed(1).padStart(5, "0")}°`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    // Sits in the left page gutter as a narrow vertical readout so it never covers content.
    <div
      className="pointer-events-none fixed bottom-6 left-3 z-40 hidden w-9 flex-col items-center gap-3 xl:left-5 lg:flex"
      aria-hidden="true"
    >
      <span className="font-mono text-[0.62rem] tracking-[0.18em] text-white/75 [writing-mode:vertical-rl] rotate-180">
        <span className="text-white/45">TRUE ANOMALY&nbsp;&nbsp;</span>
        <span className="font-serif text-[0.8rem] italic text-accent">ν</span>&nbsp;<span ref={label}>000.0°</span>
      </span>
      <svg viewBox="-28 -20 40 40" className="h-9 w-9" fill="none">
        <ellipse cx={-A * E} cy="0" rx={A} ry={B} stroke="#fff" strokeOpacity="0.5" />
        <circle r="2.6" fill="#fff" fillOpacity="0.7" />
        <line ref={vec} x1="0" y1="0" x2={A * (1 - E)} y2="0" stroke="#fff" strokeOpacity="0.5" />
        <circle ref={sat} cx={A * (1 - E)} cy="0" r="2.4" fill="#cc0033" />
      </svg>
    </div>
  );
}
