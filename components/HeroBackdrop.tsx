/**
 * Placeholder hero visual used until a real video/image is dropped into
 * public/media (see README). Pure SVG/CSS: a deterministic starfield over a
 * planetary limb, so it costs no network requests and never shifts layout.
 */
export default function HeroBackdrop() {
  // Seeded PRNG so server and client render identical markup.
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const stars = Array.from({ length: 170 }, () => ({
    x: rand() * 1600,
    y: rand() * 720,
    r: rand() < 0.92 ? 0.5 + rand() * 0.7 : 1.3 + rand() * 0.6,
    o: 0.25 + rand() * 0.65,
  }));

  return (
    <div className="absolute inset-0 bg-ink" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="limb-glow" cx="50%" cy="100%" r="75%">
            <stop offset="0%" stopColor="#0d1830" stopOpacity="0" />
            <stop offset="82%" stopColor="#10224a" stopOpacity="0.0" />
            <stop offset="93%" stopColor="#3a67c9" stopOpacity="0.5" />
            <stop offset="97%" stopColor="#9fc0ff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#9fc0ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="planet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1224" />
            <stop offset="40%" stopColor="#05070d" />
            <stop offset="100%" stopColor="#050506" />
          </linearGradient>
        </defs>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} fill="#fff" opacity={s.o.toFixed(2)} />
        ))}
        {/* Atmosphere glow + planet body */}
        <ellipse cx="800" cy="1620" rx="1500" ry="920" fill="url(#limb-glow)" />
        <ellipse cx="800" cy="1640" rx="1420" ry="900" fill="url(#planet)" />
        <ellipse cx="800" cy="1640" rx="1420" ry="900" fill="none" stroke="#b8d0ff" strokeOpacity="0.45" strokeWidth="1.2" />
      </svg>
    </div>
  );
}
