import { projects } from "@/lib/content";
import SectionHeading from "./SectionHeading";
import ProjectGallery from "./ProjectGallery";

export default function Projects() {
  return (
    <section id="projects" className="relative border-t border-line py-28 md:py-44">
      <div className="container-x" data-reveal-group>
        <SectionHeading index="03" label="Projects" title="Selected work" />
      </div>

      <div className="mt-20 space-y-28 md:mt-28 md:space-y-44">
        {projects.map((p, i) => (
          <article
            key={p.name}
            data-testid="project-card"
            className="container-x grid items-center gap-10 lg:grid-cols-12 lg:gap-12"
          >
            <ProjectGallery
              project={p}
              index={i}
              className={`lg:col-span-7 ${i % 2 ? "lg:order-2 lg:col-start-6" : ""}`}
            />

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
              <details open className="group/d mt-6 border-t border-line pt-4" data-reveal>
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
              <div className="mt-8 flex flex-wrap gap-3" data-reveal>
                <a href={p.href} target="_blank" rel="noopener" className="btn-line">
                  Visit project site <span aria-hidden="true">→</span>
                </a>
                {p.repo ? (
                  <a href={p.repo} target="_blank" rel="noopener" className="btn-line">
                    View firmware on GitHub <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
