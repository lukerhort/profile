/**
 * Viewfinder-style corner brackets. Place inside a `relative` container.
 * `adaptive` blends them with `mix-blend-mode: difference`, so they stay
 * visible over light images as well as dark ones.
 */
export default function Brackets({
  className = "",
  inset = "-10px",
  adaptive = false,
}: {
  className?: string;
  inset?: string;
  adaptive?: boolean;
}) {
  const base = `brackets-corner absolute h-5 w-5 ${adaptive ? "border-white" : "border-fg/70"}`;
  return (
    <span
      className={`pointer-events-none absolute ${adaptive ? "mix-blend-difference" : ""} ${className}`}
      style={{ inset }}
      aria-hidden="true"
    >
      <span className={`${base} left-0 top-0 border-l border-t`} />
      <span className={`${base} right-0 top-0 border-r border-t`} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
    </span>
  );
}
