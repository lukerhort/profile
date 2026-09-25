export default function SectionHeading({
  index,
  label,
  title,
  reveal = true,
}: {
  index: string;
  label: string;
  title: string;
  reveal?: boolean;
}) {
  const r = reveal ? { "data-reveal": "" } : {};
  return (
    <div>
      <p className="eyebrow flex items-center gap-4" {...r}>
        <span className="text-accent">{index}</span>
        <span className="h-px w-10 bg-line" aria-hidden="true" />
        {label}
      </p>
      <h2 className="display mt-6 text-[clamp(2.75rem,7vw,6.5rem)]" {...r}>
        {title}
      </h2>
    </div>
  );
}
