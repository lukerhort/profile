/**
 * Placeholder hero visual used until a real video/image is dropped into
 * public/media (see README). Pure SVG/CSS: a deterministic two-depth starfield,
 * a focal light behind the tracked object, and a planetary limb lit as a thin
 * crimson-to-cool band whose blurred halo slowly "breathes" (CSS only, so it
 * needs no JavaScript; reduced motion holds it at a fixed glow).
 *
 * The halo lives on its own layer so the browser rasterises the blur once and
 * the breathing is a compositor-only opacity animation.
 */

// Planet limb geometry, shared by every layer below (1600x900 "slice" frame).
const LIMB = { cx: 800, cy: 1640, rx: 1420, ry: 900 };

function stars(seed: number, count: number, rMin: number, rSpread: number, oMin: number, oSpread: number) {
  // Seeded PRNG so server and client render identical markup.
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({
    x: rand() * 1600,
    y: rand() * 760,
    r: rMin + rand() * rSpread,
    o: oMin + rand() * oSpread,
  }));
}

const FAR = stars(7, 150, 0.45, 0.55, 0.18, 0.45);
const NEAR = stars(31, 26, 1.1, 0.7, 0.5, 0.4);

/** Gradient along the limb: crimson at the flanks, cooling to a blue-white peak up-right where the light is. */
function LimbGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#cc0033" stopOpacity="0.2" />
      <stop offset="20%" stopColor="#cc0033" stopOpacity="0.95" />
      <stop offset="44%" stopColor="#ff4d6a" stopOpacity="0.95" />
      <stop offset="64%" stopColor="#dce8ff" stopOpacity="1" />
      <stop offset="82%" stopColor="#7fa6ff" stopOpacity="0.85" />
      <stop offset="100%" stopColor="#3a5fc0" stopOpacity="0.25" />
    </linearGradient>
  );
}

export default function HeroBackdrop() {
  return (
    <div className="absolute inset-0 bg-ink" aria-hidden="true">
      {/* Focal light: a cool key light up-right (behind the tracked object) and a crimson bloom off the limb. */}
      <div className="hero-focal absolute inset-0" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="limb-air" cx="50%" cy="100%" r="75%">
            <stop offset="0%" stopColor="#0d1830" stopOpacity="0" />
            <stop offset="86%" stopColor="#1a0a14" stopOpacity="0" />
            <stop offset="95%" stopColor="#6a1030" stopOpacity="0.32" />
            <stop offset="98.5%" stopColor="#9fb8ff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#9fc0ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="planet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1120" />
            <stop offset="16%" stopColor="#07080e" />
            <stop offset="100%" stopColor="#050506" />
          </linearGradient>
          {/* Night side lit faintly from the upper right. */}
          <radialGradient id="planet-shade" cx="66%" cy="0%" r="50%">
            <stop offset="0%" stopColor="#4a6fd0" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#4a6fd0" stopOpacity="0" />
          </radialGradient>
          <LimbGradient id="limb-line" />
        </defs>
        {FAR.map((s, i) => (
          <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} fill="#fff" opacity={s.o.toFixed(2)} />
        ))}
        {NEAR.map((s, i) => (
          <circle key={`n${i}`} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} fill="#eef3ff" opacity={s.o.toFixed(2)} />
        ))}
        {/* Atmosphere + planet body */}
        <ellipse cx={LIMB.cx} cy={LIMB.cy - 20} rx={LIMB.rx + 80} ry={LIMB.ry + 20} fill="url(#limb-air)" />
        <ellipse {...LIMB} fill="url(#planet)" />
        <ellipse {...LIMB} fill="url(#planet-shade)" />
        {/* The limb itself: a thin lit band */}
        <ellipse {...LIMB} fill="none" stroke="url(#limb-line)" strokeWidth="1.6" />
      </svg>

      {/* Breathing halo on its own layer: blurred once, opacity animated by CSS. */}
      <div className="hero-halo absolute inset-0">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <LimbGradient id="limb-halo" />
            <filter id="halo-wide" x="-10%" y="-20%" width="120%" height="140%">
              <feGaussianBlur stdDeviation="24" />
            </filter>
            <filter id="halo-tight" x="-10%" y="-20%" width="120%" height="140%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <ellipse {...LIMB} fill="none" stroke="url(#limb-halo)" strokeWidth="56" strokeOpacity="0.7" filter="url(#halo-wide)" />
          <ellipse {...LIMB} fill="none" stroke="url(#limb-halo)" strokeWidth="8" filter="url(#halo-tight)" />
        </svg>
      </div>
    </div>
  );
}
