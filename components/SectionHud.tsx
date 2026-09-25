"use client";

import { useEffect, useRef, useState } from "react";
import { nav } from "@/lib/content";

const SECTIONS = [{ href: "#top", label: "Home" }, ...nav];

/** Fixed left-gutter indicator: current section + page progress. Desktop only. */
export default function SectionHud() {
  const [active, setActive] = useState(0);
  const fill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      fill.current?.style.setProperty("transform", `scaleY(${max > 0 ? window.scrollY / max : 0})`);
      const mid = window.innerHeight * 0.45;
      let idx = 0;
      SECTIONS.forEach((s, i) => {
        const el = document.querySelector(s.href);
        if (el && el.getBoundingClientRect().top <= mid) idx = i;
      });
      setActive(idx);
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
    <div
      className="pointer-events-none fixed bottom-6 left-3 z-40 hidden w-9 flex-col items-center gap-3 lg:flex xl:left-5"
      aria-hidden="true"
    >
      <span className="rotate-180 font-mono text-[0.62rem] tracking-[0.2em] text-fg/75 uppercase [writing-mode:vertical-rl]">
        <span className="text-accent">{String(active).padStart(2, "0")}</span>
        <span className="text-fg/35">&nbsp;&nbsp;/&nbsp;&nbsp;</span>
        {SECTIONS[active].label}
      </span>
      <span className="relative block h-16 w-px bg-fg/15">
        <span ref={fill} className="absolute inset-0 origin-top scale-y-0 bg-accent" />
      </span>
    </div>
  );
}
