"use client";

import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/lib/content";
import { getLenis } from "./Motion";

/** Release the open menu's scroll lock right away (before a link navigates). */
function unlockScroll() {
  document.documentElement.style.overflow = "";
  getLenis()?.start();
}

/**
 * Fixed nav: hides while scrolling down, reappears on scroll up, and always
 * shows while keyboard focus is inside it. Below `lg` the links collapse into
 * a full-screen menu that traps focus (everything else is inert), locks page
 * scrolling (Lenis included), and hands focus back to the toggle when it is
 * closed with Escape or the toggle.
 *
 * Without JavaScript (no `js` class on <html>) the header keeps a solid
 * backdrop (see `.site-header` in sections.css) so it never sits bare over
 * body text; with JS it is transparent only at the very top of the page.
 */
export default function Nav() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

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

  // Open menu: Escape closes, the rest of the page is inert, scrolling is locked.
  useEffect(() => {
    if (!open) return;
    const headerEl = header.current;
    const parent = headerEl?.parentElement;
    const siblings = parent
      ? Array.from(parent.children).filter((el): el is HTMLElement => el !== headerEl && el instanceof HTMLElement)
      : [];
    siblings.forEach((el) => (el.inert = true));
    document.documentElement.style.overflow = "hidden";
    getLenis()?.stop();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        restoreFocus.current = true;
        setOpen(false);
      }
    };
    // Past the breakpoint the menu does not exist; close it.
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      siblings.forEach((el) => (el.inert = false));
      unlockScroll();
      if (restoreFocus.current) {
        restoreFocus.current = false;
        toggle.current?.focus();
      }
    };
  }, [open]);

  const closeForLink = () => {
    unlockScroll();
    setOpen(false);
  };

  const show = !hidden || open || focusWithin;

  return (
    <header
      ref={header}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
      }}
      className={`site-header fixed inset-x-0 top-0 z-50 border-b transition-[translate,transform,background-color,border-color] duration-500 ease-(--ease-out-expo) ${
        show ? "translate-y-0" : "-translate-y-full"
      } ${open ? "border-line bg-ink" : solid ? "border-line bg-ink/80 backdrop-blur-md" : "is-top border-transparent"}`}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-6 md:h-20" aria-label="Primary">
        <a
          href="#top"
          className="display shrink-0 whitespace-nowrap text-xl tracking-[0.18em] md:text-2xl"
          onClick={closeForLink}
        >
          {site.name}
        </a>

        <ul className="hidden items-center gap-8 lg:flex xl:gap-10">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="whitespace-nowrap font-mono text-[0.7rem] uppercase tracking-[0.22em] text-fg/70 transition-colors hover:text-fg"
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
              className="whitespace-nowrap border border-accent/70 px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-fg transition-colors hover:bg-accent"
            >
              Resume
            </a>
          </li>
        </ul>

        <button
          ref={toggle}
          type="button"
          className="relative h-10 w-10 shrink-0 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => {
            if (open) restoreFocus.current = true;
            setOpen((o) => !o);
          }}
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
        className={`${open ? "menu-open " : ""}fixed inset-x-0 top-16 h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-ink transition-opacity duration-300 md:top-20 md:h-[calc(100dvh-5rem)] lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <ul className="container-x flex flex-col gap-6 pb-10 pt-10">
          {nav.map((item, i) => (
            <li key={item.href} className="menu-link" style={{ "--i": i } as React.CSSProperties}>
              <a href={item.href} className="display text-5xl" onClick={closeForLink}>
                {item.label}
              </a>
            </li>
          ))}
          <li className="menu-link" style={{ "--i": nav.length } as React.CSSProperties}>
            <a href={site.resume} target="_blank" rel="noopener" className="display text-5xl text-accent">
              Resume ↗
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
