import { gsap } from "gsap";

/**
 * Telemetry-style "decode" for a heading. Markup contract:
 *
 *   <h3 data-scramble-host>
 *     <span data-scramble-src>Real title</span>        (always the real text; stays in the DOM)
 *     <span data-scramble-fx aria-hidden="true" />     (absolutely positioned overlay, empty at rest)
 *   </h3>
 *
 * While decoding, the real text is made transparent (still laid out and still
 * read by assistive tech) and the overlay shows glyphs that resolve left to
 * right into the real text. On completion, interruption or `settle`, the
 * overlay is emptied and the real text restored, so the DOM never stays
 * scrambled.
 */

const GLYPHS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789/#<>+=";
const active = new WeakMap<HTMLElement, gsap.core.Tween>();

function parts(host: HTMLElement) {
  return {
    src: host.querySelector<HTMLElement>("[data-scramble-src]"),
    fx: host.querySelector<HTMLElement>("[data-scramble-fx]"),
  };
}

/** Stop any decode on `host` and show the real text. */
export function settle(host: HTMLElement) {
  const running = active.get(host);
  active.delete(host); // before kill(): onInterrupt re-enters settle()
  running?.kill();
  const { src, fx } = parts(host);
  if (fx) fx.textContent = "";
  src?.classList.remove("scramble-on");
}

export function scramble(host: HTMLElement, duration = 0.55) {
  settle(host);
  const { src, fx } = parts(host);
  if (!src || !fx) return;
  const text = src.textContent ?? "";
  const n = text.length;
  src.classList.add("scramble-on");
  const state = { p: 0 };
  let frame = 0;
  let glyphs = "";
  const tween = gsap.to(state, {
    p: 1,
    duration,
    ease: "none",
    onUpdate() {
      // New random glyphs every other frame reads as "decoding" rather than noise.
      if (frame++ % 2 === 0 || !glyphs) {
        glyphs = Array.from(text, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]).join("");
      }
      // Characters lock in left to right over the last ~75% of the run.
      const locked = Math.floor(Math.max(0, (state.p - 0.25) / 0.75) * n);
      let out = "";
      for (let i = 0; i < n; i++) {
        const c = text[i];
        out += i < locked || !/[A-Za-z0-9]/.test(c) ? c : glyphs[i];
      }
      fx.textContent = out;
    },
    onComplete: () => settle(host),
    onInterrupt: () => settle(host),
  });
  active.set(host, tween);
}
