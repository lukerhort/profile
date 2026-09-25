"use client";

import { useEffect, useState } from "react";
import { nav, site } from "@/lib/content";

/** Fixed nav: hides while scrolling down, reappears on scroll up. */
export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 120);
        last = y;
      }
      setSolid(y > 40);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const show = !hidden || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color] duration-500 ease-(--ease-out-expo) ${
        show ? "translate-y-0" : "-translate-y-full"
      } ${solid || open ? "border-b border-line bg-ink/80 backdrop-blur-md" : "border-b border-transparent"}`}
    >
      <nav className="container-x flex h-16 items-center justify-between md:h-20" aria-label="Primary">
        <a href="#top" className="display text-xl tracking-[0.18em] md:text-2xl" onClick={() => setOpen(false)}>
          {site.name}
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-fg/70 transition-colors hover:text-fg"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={site.resume}
              target="_blank"
              rel="noopener"
              className="border border-accent/70 px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-fg transition-colors hover:bg-accent"
            >
              Resume
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="relative h-10 w-10 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span
            className={`absolute left-2 right-2 h-px bg-fg transition-transform duration-300 ${open ? "top-1/2 rotate-45" : "top-[38%]"}`}
          />
          <span
            className={`absolute left-2 right-2 h-px bg-fg transition-transform duration-300 ${open ? "top-1/2 -rotate-45" : "top-[62%]"}`}
          />
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-16 h-[calc(100dvh-4rem)] bg-ink/95 backdrop-blur-lg transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <ul className="container-x flex flex-col gap-6 pt-10">
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="display text-5xl" onClick={() => setOpen(false)}>
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a href={site.resume} target="_blank" rel="noopener" className="display text-5xl text-accent">
              Resume ↗
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
