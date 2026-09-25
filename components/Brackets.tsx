/** Viewfinder-style corner brackets. Place inside a `relative` container. */
export default function Brackets({ className = "", inset = "-10px" }: { className?: string; inset?: string }) {
  const base = "absolute h-5 w-5 border-fg/70";
  return (
    <span className={`pointer-events-none absolute ${className}`} style={{ inset }} aria-hidden="true">
      <span className={`${base} left-0 top-0 border-l border-t`} />
      <span className={`${base} right-0 top-0 border-r border-t`} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
    </span>
  );
}
