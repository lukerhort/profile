import Image from "next/image";
import { projects } from "@/lib/content";
import SectionHeading from "./SectionHeading";

export default function Projects() {
  return (
    <section id="projects" className="relative border-t border-line py-28 md:py-44">
      <div className="container-x" data-reveal-group>
        <SectionHeading index="03" label="Projects" title="Selected work" />
      </div>

      <div className="mt-20 space-y-28 md:mt-28 md:space-y-44">
        {projects.map((p, i) => (
          <article key={p.name} className="container-x grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <a
              href={p.href}
              target="_blank"
              rel="noopener"
              aria-label={`${p.name} project site`}
              className={`group relative block aspect-[4/3] overflow-hidden bg-ink-2 lg:col-span-7 ${
                i % 2 ? "lg:order-2 lg:col-start-6" : ""
              }`}
              data-reveal
            >
              <div data-parallax="0.1" className="absolute -inset-y-[6%] inset-x-0">
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className={`transition-transform duration-1000 ease-(--ease-out-expo) group-hover:scale-[1.03] ${
                    p.image.fit === "contain" ? "object-contain p-[12%]" : "object-cover"
                  }`}
                />
              </div>
              <span className="eyebrow absolute left-4 top-4 flex items-center gap-2 bg-ink/70 px-3 py-1.5 text-fg/80 backdrop-blur">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${p.status === "Complete" ? "bg-emerald-400" : "bg-amber-400"}`}
                  aria-hidden="true"
                />
                {p.status}
              </span>
            </a>

            <div
              className={`lg:col-span-4 ${i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}
              data-reveal-group
            >
              <p className="eyebrow" data-reveal>
                {p.tag}
              </p>
              <h3 className="display mt-5 text-[clamp(3rem,6vw,5.5rem)]" data-reveal>
                {p.name}
              </h3>
              <p className="display mt-1 text-xl font-medium tracking-[0.14em] text-fg/70 md:text-2xl" data-reveal>
                {p.subtitle}
              </p>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-accent" data-reveal>
                {p.role}
              </p>
              <p className="mt-4 leading-relaxed text-fg/70 md:text-lg" data-reveal>
                {p.summary}
              </p>
              <ul className="mt-6 flex flex-wrap gap-2" data-reveal>
                {p.stats.map((s) => (
                  <li key={s} className="border border-line px-3 py-1.5 font-mono text-[0.7rem] text-fg/70">
                    {s}
                  </li>
                ))}
              </ul>
              <details className="group/d mt-6 border-t border-line pt-4" data-reveal>
                <summary className="eyebrow cursor-pointer list-none text-fg/70 transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
                  <span className="mr-2 inline-block transition-transform group-open/d:rotate-45">+</span>
                  My role in detail
                </summary>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-fg/60">
                  {p.details.map((d) => (
                    <p key={d}>{d}</p>
                  ))}
                </div>
              </details>
              <div className="mt-8" data-reveal>
                <a href={p.href} target="_blank" rel="noopener" className="btn-line">
                  Visit project site <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
