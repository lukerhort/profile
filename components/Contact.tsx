import { site } from "@/lib/content";
import OrbitRings from "./OrbitRings";

export default function Contact() {
  const links = [
    { label: "Email", value: site.email, href: `mailto:${site.email}` },
    { label: "LinkedIn", value: "luke-r-horton", href: site.links.linkedin },
    { label: "GitHub", value: "lukerhort", href: site.links.github },
    { label: "Resume", value: "Download PDF", href: site.resume },
  ];

  return (
    <section id="contact" className="relative overflow-hidden border-t border-line pb-16 pt-28 md:pt-44">
      <div
        data-orbit-spin="40"
        className="pointer-events-none absolute right-[-35%] top-10 w-[150%] md:right-[-12%] md:top-16 md:w-[70%]"
      >
        <OrbitRings className="h-auto w-full" boost={1.45} />
      </div>
      <div className="container-x relative" data-reveal-group>
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
                  className="contact-row group relative isolate flex flex-wrap items-center gap-x-4 gap-y-1 overflow-hidden px-4 py-5 md:flex-nowrap md:gap-x-6 md:px-6 md:py-8"
                >
                  <span aria-hidden="true" className="contact-fill absolute inset-0 -z-10 bg-accent" />
                  <span className="eyebrow contact-label w-full shrink-0 md:w-28">{l.label}</span>
                  <span
                    className={`display min-w-0 flex-1 text-[1.45rem] leading-[1.2] [overflow-wrap:anywhere] md:text-5xl md:leading-[1.15] ${l.label === "Email" ? "normal-case" : ""}`}
                  >
                    {l.value}
                  </span>
                  <span
                    aria-hidden="true"
                    className="contact-tx hidden shrink-0 border border-white/70 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white sm:inline-block"
                  >
                    TX ready
                  </span>
                  <span aria-hidden="true" className="contact-arrow shrink-0 text-2xl">
                    →
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="container-x relative mt-24 flex flex-col justify-between gap-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-dim sm:flex-row">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>
          {site.title} · {site.location}
        </span>
      </footer>
    </section>
  );
}
