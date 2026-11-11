"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * A big stat that counts up once when scrolled into view, with a crimson rule
 * drawing in beneath it. The final value ("$200K+") is the server-rendered
 * text; the tween only runs when motion is allowed, preserves the prefix and
 * suffix around the number, and always ends on the exact original string.
 * `.stat-num` reserves the final width so nothing shifts while counting.
 */
export default function StatCount({ value }: { value: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const rule = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const m = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
      if (!m || !num.current || !rule.current) return;
      const [, prefix, digits, suffix] = m;
      const target = parseInt(digits.replace(/,/g, ""), 10);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { n: 0 };
        const el = num.current!;
        const render = () => {
          el.textContent = `${prefix}${Math.round(counter.n)}${suffix}`;
        };
        render();
        const tl = gsap.timeline({ paused: true });
        tl.to(counter, {
          n: target,
          duration: 1.4,
          ease: "power3.out",
          onUpdate: render,
          onComplete: () => {
            el.textContent = value;
          },
        });
        tl.fromTo(rule.current, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power3.out" }, 0);
        // If the stat is already behind the reader (reload mid-page, anchor jump),
        // onLeave fires too and we jump straight to the final state.
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top 88%",
          onEnter: () => tl.play(),
          onLeave: () => {
            tl.progress(1);
            el.textContent = value;
          },
        });
        return () => {
          st.kill();
          el.textContent = value;
        };
      });
    },
    { scope: root, dependencies: [value] },
  );

  return (
    <span ref={root} className="block">
      <span ref={num} className="stat-num" data-final={value}>
        {value}
      </span>
      <span ref={rule} className="stat-rule" aria-hidden="true" />
    </span>
  );
}
