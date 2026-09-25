/**
 * Decorative inclined orbit tracks with a few spacecraft, one under track. Pair with
 * data-orbit-spin on a wrapper to have Motion rotate it as the page scrolls.
 */
export default function OrbitRings({ className = "" }: { className?: string }) {
  const rings = [
    { rx: 300, ry: 118, tilt: -16, opacity: 0.16, dash: undefined, sat: 0.62 },
    { rx: 240, ry: 196, tilt: 28, opacity: 0.1, dash: "2 7", sat: 2.4 },
    { rx: 360, ry: 70, tilt: 8, opacity: 0.08, dash: undefined, sat: 4.1 },
  ];
  return (
    <svg viewBox="-380 -260 760 520" className={className} fill="none" aria-hidden="true">
      {rings.map((r, i) => {
        const x = r.rx * Math.cos(r.sat);
        const y = r.ry * Math.sin(r.sat);
        return (
          <g key={i} transform={`rotate(${r.tilt})`}>
            <ellipse rx={r.rx} ry={r.ry} stroke="#fff" strokeOpacity={r.opacity} strokeDasharray={r.dash} />
            <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={i === 0 ? 4 : 2.5} fill={i === 0 ? "#cc0033" : "#fff"} fillOpacity={i === 0 ? 1 : 0.5} />
            {i === 0 ? (
              <path
                transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
                d="M-12 -6 V-12 H-6 M6 -12 H12 V-6 M12 6 V12 H6 M-6 12 H-12 V6"
                stroke="#fff"
                strokeOpacity="0.6"
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
