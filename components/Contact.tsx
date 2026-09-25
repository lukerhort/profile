import { site } from "@/lib/content";

export default function Contact() {
  const links = [
    { label: "Email", value: site.email, href: `mailto:${site.email}` },
    { label: "LinkedIn", value: "luke-r-horton", href: site.links.linkedin },
    { label: "GitHub", value: "lukerhort", href: site.links.github },
    { label: "Resume", value: "Download PDF", href: site.resume },
  ];

  return (
    <section id="contact" className="relative overflow-hidden border-t border-line pb-16 pt-28 md:pt-44">
      <div className="container-x" data-reveal-group>
        <p className="eyebrow flex items-center gap-4" data-reveal>
          <span className="text-accent">06</span>
          <span className="h-px w-10 bg-line" aria-hidden="true" />
          Contact
        </p>
        <h2 className="display mt-6 text-[clamp(4rem,14vw,12rem)]" data-reveal>
          Let&rsquo;s talk
        </h2>
        <p className="mt-6 max-w-xl text-lg text-fg/70" data-reveal>
          Always happy to talk spacecraft avionics, systems engineering, test, or hardware that flies.
        </p>

        <ul className="mt-16 divide-y divide-line border-y border-line" data-reveal>
          {links.map((l) => {
            const external = !l.href.startsWith("mailto:");
            return (
              <li key={l.label}>
                <a
                  href={l.href}
                  {...(external ? { target: "_blank", rel: "noopener" } : {})}
                  className="group flex items-center justify-between gap-6 py-6 transition-colors hover:text-accent md:py-8"
                >
                  <span className="eyebrow w-28 shrink-0 group-hover:text-accent">{l.label}</span>
                  <span
                    className={`display flex-1 truncate text-2xl md:text-5xl ${l.label === "Email" ? "normal-case" : ""}`}
                  >
                    {l.value}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-2xl transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-2"
                  >
                    →
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="container-x mt-24 flex flex-col justify-between gap-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-dim sm:flex-row">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>
          {site.title} · {site.location}
        </span>
      </footer>
    </section>
  );
}
