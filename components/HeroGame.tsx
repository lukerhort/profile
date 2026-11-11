"use client";

import { useEffect, useRef } from "react";

/**
 * A small shooter that lives in the hero. A ship trails the cursor; a click
 * (or holding the button) fires lasers at debris drifting down the screen.
 * There is no way to lose: it is a toy, not a level.
 *
 * It only runs with a mouse or pen, with motion allowed, and while the hero is
 * on screen. It never takes clicks away from the page: the canvas ignores
 * pointer events, and clicks on links and buttons do not fire.
 */

type Rock = { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; shape: number[] };
type Shot = { x: number; y: number; from: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number };
type Ring = { x: number; y: number; life: number };

const FG = "#f4f1ec";
const HOT = "#ff8a3d";
const MAX_ROCKS = 6;
const SHOT_SPEED = 950; // px per second
const FIRE_EVERY = 0.14; // seconds between shots while the button is held

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function newRock(w: number): Rock {
  const r = rand(10, 22);
  return {
    x: rand(r, w - r),
    y: -r - 4,
    vx: rand(-22, 22),
    vy: rand(28, 70),
    r,
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.9, 0.9),
    // An uneven outline: one radius multiplier per corner.
    shape: Array.from({ length: 8 }, () => rand(0.68, 1.08)),
  };
}

export default function HeroGame() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const hud = useRef<HTMLParagraphElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const cv = canvas.current!;
    const section = cv.closest("section")!;
    const allowed = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let visible = true;
    let running = false;
    let engaged = false; // the pointer has entered the hero at least once
    let firing = false;
    let pressed = false; // a press that started in the game area is still held
    let cooldown = 0;
    let spawnIn = 1.2;
    let score = 0;
    let shotsFired = 0;
    const ship = { x: 0, y: 0, tx: 0, ty: 0 };
    let rocks: Rock[] = [];
    let shots: Shot[] = [];
    let sparks: Spark[] = [];
    let rings: Ring[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = section.clientWidth;
      h = section.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const fire = () => {
      shots.push({ x: ship.x, y: ship.y - 14, from: ship.y - 14 });
      shotsFired++;
      cv.dataset.shots = String(shotsFired);
      cooldown = FIRE_EVERY;
      if (hint.current) hint.current.dataset.done = "true";
    };

    const hit = (rock: Rock) => {
      score++;
      cv.dataset.score = String(score);
      if (hud.current) {
        hud.current.textContent = `Debris cleared ${String(score).padStart(3, "0")}`;
        hud.current.dataset.on = "true";
      }
      rings.push({ x: rock.x, y: rock.y, life: 0 });
      for (let i = 0; i < 12; i++) {
        const a = rand(0, Math.PI * 2);
        const s = rand(40, 190);
        const max = rand(0.3, 0.7);
        sparks.push({ x: rock.x, y: rock.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: max, max });
      }
    };

    const step = (dt: number) => {
      // Ship eases toward a point just below the cursor, so the arrow does not cover it.
      const k = 1 - Math.exp(-dt * 11);
      ship.x += (ship.tx - ship.x) * k;
      ship.y += (ship.ty - ship.y) * k;

      cooldown -= dt;
      if (firing && cooldown <= 0) fire();

      spawnIn -= dt;
      if (spawnIn <= 0 && rocks.length < MAX_ROCKS) {
        rocks.push(newRock(w));
        spawnIn = rand(0.7, 1.7);
      }

      for (const s of shots) {
        s.from = s.y;
        s.y -= SHOT_SPEED * dt;
      }
      shots = shots.filter((s) => s.y > -20);

      for (const r of rocks) {
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.rot += r.vr * dt;
      }
      rocks = rocks.filter((r) => {
        if (r.y - r.r > h || r.x + r.r < 0 || r.x - r.r > w) return false;
        // A shot hits if the path it covered this frame crosses the rock (a fast shot can jump past the centre).
        const reach = r.r + 4;
        const i = shots.findIndex((s) => Math.abs(s.x - r.x) < reach && r.y > s.y - reach && r.y < s.from + reach);
        if (i < 0) return true;
        shots.splice(i, 1);
        hit(r);
        return false;
      });

      for (const p of sparks) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
      }
      sparks = sparks.filter((p) => p.life > 0);
      for (const r of rings) r.life += dt;
      rings = rings.filter((r) => r.life < 0.45);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "round";

      // Debris: faint outlines, so the name stays readable behind them.
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = FG;
      for (const r of rocks) {
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        r.shape.forEach((m, i) => {
          const a = r.rot + (i / r.shape.length) * Math.PI * 2;
          const x = r.x + Math.cos(a) * r.r * m;
          const y = r.y + Math.sin(a) * r.r * m;
          if (i) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.strokeStyle = HOT;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (const s of shots) {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + 14);
        ctx.stroke();
      }

      ctx.fillStyle = HOT;
      for (const p of sparks) {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillRect(p.x - 1.25, p.y - 1.25, 2.5, 2.5);
      }
      ctx.lineWidth = 1.5;
      for (const r of rings) {
        ctx.globalAlpha = 1 - r.life / 0.45;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 6 + r.life * 90, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (engaged) {
        const { x, y } = ship;
        // Engine flame flickers.
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = HOT;
        const flame = 7 + Math.sin(t / 45) * 2.5;
        ctx.beginPath();
        ctx.moveTo(x - 3.5, y + 9);
        ctx.lineTo(x, y + 9 + flame);
        ctx.lineTo(x + 3.5, y + 9);
        ctx.closePath();
        ctx.fill();
        // Hull: a small dart with swept wings.
        ctx.globalAlpha = 1;
        ctx.fillStyle = FG;
        ctx.beginPath();
        ctx.moveTo(x, y - 14);
        ctx.lineTo(x + 4.5, y + 2);
        ctx.lineTo(x + 13, y + 10);
        ctx.lineTo(x + 4, y + 8);
        ctx.lineTo(x, y + 10);
        ctx.lineTo(x - 4, y + 8);
        ctx.lineTo(x - 13, y + 10);
        ctx.lineTo(x - 4.5, y + 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      step(dt);
      draw(t);
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      const should = allowed.matches && visible && !document.hidden;
      cv.dataset.active = String(should);
      if (should === running) return;
      running = should;
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
        firing = false;
        if (!allowed.matches) ctx.clearRect(0, 0, w, h);
      }
    };

    const local = (e: PointerEvent) => {
      const b = section.getBoundingClientRect();
      return { x: e.clientX - b.left, y: e.clientY - b.top };
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const p = local(e);
      ship.tx = p.x;
      ship.ty = p.y + 30;
      // If the window lost focus mid-press, firing picks up again on the next move.
      if (pressed && running) firing = (e.buttons & 1) === 1;
      if (!engaged) {
        engaged = true;
        ship.x = ship.tx;
        ship.y = ship.ty;
        if (hint.current) hint.current.dataset.on = "true";
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!running || e.pointerType === "touch" || e.button !== 0) return;
      // Links and buttons keep their clicks.
      if (e.target instanceof Element && e.target.closest("a, button")) return;
      pressed = true;
      onMove(e);
      firing = true;
      if (cooldown <= 0) fire();
    };
    const onUp = () => {
      pressed = false;
      firing = false;
    };
    const onBlur = () => {
      firing = false;
    };
    // Firing over the name or the tagline must not start a text selection.
    const onMouseDown = (e: MouseEvent) => {
      if (!running || e.button !== 0) return;
      if (e.target instanceof Element && e.target.closest("a, button")) return;
      e.preventDefault();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(section);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(section);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerdown", onDown);
    section.addEventListener("mousedown", onMouseDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", sync);
    allowed.addEventListener("change", sync);
    sync();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerdown", onDown);
      section.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", sync);
      allowed.removeEventListener("change", sync);
    };
  }, []);

  return (
    <div className="hero-game pointer-events-none absolute inset-0" aria-hidden="true">
      <canvas ref={canvas} data-testid="hero-game" data-active="false" data-shots="0" data-score="0" className="h-full w-full" />
      <p ref={hint} className="hero-game-hint eyebrow">
        Click to fire
      </p>
      <p ref={hud} className="hero-game-hud eyebrow" />
    </div>
  );
}
