// Two-body orbit helpers used by the decorative orbit graphics.

const TAU = Math.PI * 2;

/** Solve Kepler's equation M = E - e·sin(E) for the eccentric anomaly E. */
export function eccentricAnomaly(M: number, e: number) {
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

/**
 * State on an ellipse (semi-major axis a, eccentricity e) for a given
 * fraction of the orbital period (0..1). Positions are relative to the focus,
 * with periapsis on the +x axis.
 */
export function orbitState(fraction: number, a: number, e: number) {
  const M = (((fraction % 1) + 1) % 1) * TAU;
  const E = eccentricAnomaly(M, e);
  const b = a * Math.sqrt(1 - e * e);
  const x = a * (Math.cos(E) - e);
  const y = b * Math.sin(E);
  // True anomaly ν, normalized to 0..2π
  let nu = Math.atan2(y, x);
  if (nu < 0) nu += TAU;
  return { x, y, nu, r: Math.hypot(x, y) };
}

export const deg = (rad: number) => (rad * 180) / Math.PI;
