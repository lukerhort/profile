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

type Box = { x0: number; y0: number; x1: number; y1: number };

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

/** Gap between two boxes (0 when they overlap). */
function gap(a: Box, b: Box) {
  const dx = Math.max(b.x0 - a.x1, a.x0 - b.x1, 0);
  const dy = Math.max(b.y0 - a.y1, a.y0 - b.y1, 0);
  return Math.hypot(dx, dy);
}

/**
 * Orbital traffic moving along tracks above the planet limb. Objects fade out
 * as they approach the hero copy, buttons and tracker readouts (anything in
 * the hero marked data-hero-in or data-keepout), so they never cross them.
 */
export function OrbitalTraffic() {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = root.current!;
      const hero = svg.closest("section") ?? document.body;
      const nodes = gsap.utils.toArray<SVGGElement>("[data-obj]", svg);
      let keepouts: Box[] = [];

      // Keep-out boxes in the SVG's own user units.
      const measure = () => {
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const inv = ctm.inverse();
        const toUser = (x: number, y: number) => new DOMPoint(x, y).matrixTransform(inv);
        keepouts = Array.from(hero.querySelectorAll<HTMLElement>("[data-hero-in], [data-keepout]")).map((el) => {
          const r = el.getBoundingClientRect();
          const a = toUser(r.left, r.top);
          const b = toUser(r.right, r.bottom);
          return { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
        });
      };

      // Last written attribute values: objects move slowly, so most frames
      // round to the same string and need no DOM write at all.
      const lastT: string[] = [];
      const lastO: string[] = [];
      const place = (time: number) =>
        nodes.forEach((node, i) => {
          const o = OBJECTS[i];
          const f = (((o.phase + time / o.period) % 1) + 1) % 1;
          const { x, y } = pointOnTrack(o.track, f);
          const t = `translate(${x.toFixed(1)} ${y.toFixed(1)})`;
          if (t !== lastT[i]) node.setAttribute("transform", (lastT[i] = t));
          // Fade in/out near the ends of the visible arc so wrap-around is invisible,
          // and out again before touching any keep-out box.
          const self: Box = { x0: x - 12, y0: y - 22, x1: x + (o.label ? 72 : 12), y1: y + 12 };
          let clear = 1;
          for (const k of keepouts) clear = Math.min(clear, (gap(self, k) - 16) / 40);
          const op = Math.max(0, Math.min(1, f * 8, (1 - f) * 8, clear)).toFixed(2);
          if (op !== lastO[i]) node.setAttribute("opacity", (lastO[i] = op));
        });

      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          measure();
          place(0);
          const ro = new ResizeObserver(() => measure());
          ro.observe(svg);
          if (ctx.conditions?.reduce) return () => ro.disconnect();
          // The hero copy is still sliding in (CSS) when this runs; re-measure once it has landed.
          const settle = gsap.delayedCall(2, measure);
          let visible = true;
          const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
          io.observe(svg);
          const t0 = gsap.ticker.time;
          const tick = (time: number) => {
            if (visible) place(time - t0);
          };
          gsap.ticker.add(tick);
          return () => {
            gsap.ticker.remove(tick);
            settle.kill();
            io.disconnect();
            ro.disconnect();
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

// ---------------------------------------------------------------------------
// Tracked object + reticle + live readouts

const pad2 = (n: number) => String(Math.floor(n)).padStart(2, "0");

/** Mission clock starts mid-pass so the numbers look like a live track, not a fresh boot. */
const T0 = 2 * 3600 + 14 * 60 + 37;

function clock(t: number) {
  const s = T0 + t;
  return `T+ ${pad2(s / 3600)}:${pad2((s / 60) % 60)}:${pad2(s % 60)}.${Math.floor((s * 10) % 10)}`;
}

/** Smoothly varying, plausible LEO-pass telemetry. dx/dy: reticle offset from the target, in px. */
function telemetry(t: number, dx = 0, dy = 0) {
  const range = 1284.6 + 38 * Math.sin(t * 0.05) + 2.4 * Math.sin(t * 0.43);
  const az = 131.24 + 1.8 * Math.sin(t * 0.031) + 0.25 * Math.sin(t * 0.37) + dx * 0.018;
  const el = 41.07 + 1.1 * Math.cos(t * 0.027) + 0.18 * Math.sin(t * 0.29) - dy * 0.018;
  return {
    range: `RNG ${range.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} KM`,
    azel: `AZ ${(((az % 360) + 360) % 360).toFixed(2).padStart(6, "0")}°  EL ${el.toFixed(2)}°`,
  };
}

const STATIC = telemetry(0);

/**
 * Tracked object under a targeting reticle, with a second vehicle performing
 * proximity operations around it and a block of live readouts beneath.
 *
 * Without JavaScript (or with reduced motion) the reticle sits locked on the
 * target and the readouts show fixed values. With motion, ~1.2 s after load
 * the reticle snaps from the centre of the frame onto the target and reports
 * LOCK; on desktop it then follows the cursor with lag ("SLEW") and drifts
 * home to re-lock when the pointer goes idle.
 */
export function TrackReticle({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrap = root.current!;
      const hero = wrap.closest("section") ?? document.body;
      const reticle = wrap.querySelector<SVGSVGElement>("[data-trk-reticle]")!;
      const brackets = wrap.querySelector<SVGGElement>("[data-trk-brackets]")!;
      const status = wrap.querySelector<HTMLElement>("[data-trk-status]")!;
      const clockEl = wrap.querySelector<HTMLElement>("[data-trk-clock]")!;
      const rangeEl = wrap.querySelector<HTMLElement>("[data-trk-range]")!;
      const azelEl = wrap.querySelector<HTMLElement>("[data-trk-azel]")!;

      const setStatus = (s: "ACQ" | "LOCK" | "SLEW") => {
        if (status.dataset.state === s) return;
        status.dataset.state = s;
        status.textContent = s;
      };

      // Screen position of the tracked object (40% / 50% of this box: the SVG's 0,0).
      const targetPoint = () => {
        const r = wrap.getBoundingClientRect();
        return { x: r.left + r.width * 0.4, y: r.top + r.height * 0.5 };
      };

      /**
       * Clamp a desired reticle centre (screen px) so the brackets never sit on
       * the hero copy/buttons or under the nav: if the reticle box would touch
       * the copy block, push it out (up or right, whichever valid move is
       * shorter), then keep it inside the hero below the header.
       */
      const safePoint = (x: number, y: number) => {
        const r = (64 * wrap.getBoundingClientRect().width) / 300 + 12; // bracket extent + margin
        const h = hero.getBoundingClientRect();
        const navH = (document.querySelector(".site-header") as HTMLElement | null)?.offsetHeight ?? 0;
        const minX = h.left + r + 8;
        const maxX = h.right - r - 8;
        const minY = Math.max(h.top, 0) + navH + r + 8;
        const maxY = h.bottom - r - 8;
        const clampXY = (px: number, py: number) => ({
          x: Math.min(maxX, Math.max(minX, px)),
          y: Math.min(maxY, Math.max(minY, py)),
        });
        let c = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
        const range = document.createRange();
        hero.querySelectorAll<HTMLElement>("[data-hero-copy] [data-hero-in]").forEach((el) => {
          // The extent of the content, not the (full-width) block box.
          range.selectNodeContents(el);
          const b = range.getBoundingClientRect();
          if (!b.width) return;
          c = {
            left: Math.min(c.left, b.left),
            top: Math.min(c.top, b.top),
            right: Math.max(c.right, b.right),
            bottom: Math.max(c.bottom, b.bottom),
          };
        });
        let p = clampXY(x, y);
        const hits = (q: { x: number; y: number }) =>
          q.x + r > c.left && q.x - r < c.right && q.y + r > c.top && q.y - r < c.bottom;
        if (Number.isFinite(c.left) && hits(p)) {
          const up = clampXY(p.x, c.top - r);
          const right = clampXY(c.right + r, p.y);
          const options = [up, right].filter((q) => !hits(q));
          if (options.length) {
            options.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
            p = options[0];
          } else {
            p = clampXY(c.right + r, minY); // top-right of the copy: always clear
          }
        }
        return p;
      };

      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          fine: "(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) and (min-width: 768px)",
        },
        (ctx) => {
          const fine = !!ctx.conditions?.fine;
          let visible = true;
          const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
          io.observe(hero);

          // --- Lock-on intro: from a point near the top of the frame (clear of
          // the copy and nav) to the target.
          const intro = gsap.timeline();
          const sinceLoad = performance.now() / 1000;
          if (sinceLoad < 1.3) {
            const h = hero.getBoundingClientRect();
            const p = targetPoint();
            const fromX = fine ? h.left + h.width * 0.5 : h.left + h.width * 0.8;
            const from = safePoint(fromX, h.top + h.height * 0.2);
            setStatus("ACQ");
            intro
              .set(reticle, { x: from.x - p.x, y: from.y - p.y })
              .to(reticle, { x: 0, y: 0, duration: 0.55, ease: "expo.inOut" }, Math.max(0.2, 1.45 - sinceLoad));
          }
          intro
            .fromTo(brackets, { scale: 1.35 }, { scale: 1, duration: 0.45, ease: "back.out(2.2)" })
            .call(() => setStatus("LOCK"), [], "<0.1")
            .fromTo(status, { opacity: 0 }, { opacity: 1, duration: 0.08, repeat: 4, yoyo: true, ease: "steps(1)", immediateRender: false }, "<");

          // --- Readouts at ~10 Hz.
          const t0 = gsap.ticker.time;
          let last = -1;
          const tick = (time: number) => {
            if (!visible || time - last < 0.1) return;
            last = time;
            const t = time - t0;
            const dx = gsap.getProperty(reticle, "x") as number;
            const dy = gsap.getProperty(reticle, "y") as number;
            const tm = telemetry(t, dx, dy);
            const ck = clock(t);
            if (clockEl.textContent !== ck) clockEl.textContent = ck;
            if (rangeEl.textContent !== tm.range) rangeEl.textContent = tm.range;
            if (azelEl.textContent !== tm.azel) azelEl.textContent = tm.azel;
            if (fine && !intro.isActive()) setStatus(Math.hypot(dx, dy) > 14 ? "SLEW" : "LOCK");
          };
          gsap.ticker.add(tick);

          // --- Desktop: reticle chases the cursor with lag, drifts home when idle.
          let cleanupPointer = () => {};
          if (fine) {
            // Created on first use so they never fight the intro tween.
            let q: { x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null = null;
            const aim = (x: number, y: number) => {
              q ??= {
                x: gsap.quickTo(reticle, "x", { duration: 0.8, ease: "power3.out" }),
                y: gsap.quickTo(reticle, "y", { duration: 0.8, ease: "power3.out" }),
              };
              q.x(x);
              q.y(y);
            };
            const home = gsap.delayedCall(1.8, () => aim(0, 0)).pause();
            const onMove = (e: PointerEvent) => {
              if (intro.isActive() || e.pointerType !== "mouse") return;
              const p = targetPoint();
              const s = safePoint(e.clientX, e.clientY);
              aim(s.x - p.x, s.y - p.y);
              home.restart(true);
            };
            const onLeave = () => home.restart(true);
            hero.addEventListener("pointermove", onMove);
            hero.addEventListener("pointerleave", onLeave);
            cleanupPointer = () => {
              hero.removeEventListener("pointermove", onMove);
              hero.removeEventListener("pointerleave", onLeave);
              home.kill();
            };
          }

          return () => {
            gsap.ticker.remove(tick);
            io.disconnect();
            cleanupPointer();
            gsap.set(reticle, { clearProps: "transform" });
            setStatus("LOCK");
          };
        },
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} data-reticle className={`pointer-events-none ${className}`} aria-hidden="true">
      <div className="trk-drift relative">
        <svg viewBox="-120 -90 300 180" className="h-auto w-full overflow-visible" fill="none">
          {/* Lock glow behind the target */}
          <circle r="46" fill="url(#trk-glow)" />
          <defs>
            <radialGradient id="trk-glow">
              <stop offset="0%" stopColor="#f26b1d" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#f26b1d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Proximity-ops path + chaser vehicle */}
          <circle r="34" stroke="#f26b1d" strokeOpacity="0.6" strokeDasharray="3 5" />
          <g className="trk-circle" style={ORIGIN}>
            <g transform="translate(34 0)">
              <circle r="7" stroke="#f26b1d" strokeOpacity="0.55" />
              <rect x="-2.5" y="-2.5" width="5" height="5" fill="#ff8a3d" />
            </g>
          </g>

          {/* Target spacecraft: bus + solar arrays */}
          <g stroke="#fff" strokeOpacity="0.9">
            <rect x="-5" y="-5" width="10" height="10" fill="#060504" />
            <path d="M-5 0 H-10 M5 0 H10" />
            <rect x="-24" y="-4" width="14" height="8" fill="#fff" fillOpacity="0.1" />
            <rect x="10" y="-4" width="14" height="8" fill="#fff" fillOpacity="0.1" />
          </g>

          {/* Leader + label */}
          <path d="M54 -54 L78 -74 H176" stroke="#fff" strokeOpacity="0.4" />
          <g fill="#fff" fontSize="10" letterSpacing="2" style={{ fontFamily: "var(--font-mono)" }}>
            <text x="82" y="-80" fillOpacity="0.92">
              TRK-01
            </text>
            <text x="82" y="-60" fillOpacity="0.7">
              PROX OPS
            </text>
          </g>
          <circle cx="170" cy="-84" r="2.5" fill="#f26b1d" className="trk-blink" />
        </svg>

        {/* Reticle: same frame as the target, moved as a whole by GSAP (x/y). */}
        <svg
          data-trk-reticle
          viewBox="-120 -90 300 180"
          className="absolute inset-0 h-full w-full overflow-visible"
          fill="none"
        >
          <g data-trk-brackets style={ORIGIN}>
            <g className="trk-breathe" style={ORIGIN} stroke="#fff" strokeOpacity="0.9" strokeWidth="1.5">
              <path d="M-54 -34 V-54 H-34" />
              <path d="M34 -54 H54 V-34" />
              <path d="M54 34 V54 H34" />
              <path d="M-34 54 H-54 V34" />
            </g>
          </g>
          <g stroke="#fff" strokeOpacity="0.4">
            <path d="M0 -70 V-60 M0 60 V70 M-70 0 H-60 M60 0 H70" />
          </g>
        </svg>

        {/* Live readouts under the tracked object */}
        <div data-keepout className="trk-readout absolute left-[22%] top-full mt-1 font-mono uppercase text-fg/80 md:mt-0">
          <div className="flex items-center gap-2.5">
            <span data-trk-status data-state="LOCK" className="trk-status">
              LOCK
            </span>
            <span data-trk-clock className="text-fg/90">
              {clock(0)}
            </span>
          </div>
          <div data-trk-range className="mt-1.5">
            {STATIC.range}
          </div>
          <div data-trk-azel className="mt-0.5 whitespace-pre">
            {STATIC.azel}
          </div>
        </div>
      </div>
    </div>
  );
}
