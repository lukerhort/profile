import Image from "next/image";
import { about } from "@/lib/content";
import SectionHeading from "./SectionHeading";
import OrbitRings from "./OrbitRings";
import Brackets from "./Brackets";

export default function About() {
  return (
    // overflow-x-clip (not hidden): the portrait column is sticky on lg+, and
    // overflow hidden would make the section its scroll container.
    <section id="about" className="relative overflow-x-clip py-28 md:py-44">
      <div className="container-x grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7" data-reveal-group>
          <SectionHeading index="01" label="About" title={about.heading} />
          <div className="mt-10 max-w-2xl space-y-6 text-lg leading-relaxed text-fg/75 md:text-xl">
            {about.paragraphs.map((p) => (
              <p key={p} data-reveal>
                {p}
              </p>
            ))}
          </div>

          <dl className="mt-14 grid max-w-2xl gap-px border border-line bg-line sm:grid-cols-2" data-reveal>
            {about.facts.map((f) => (
              <div key={f.label} className="bg-ink p-5">
                <dt className="eyebrow">{f.label}</dt>
                <dd className="mt-2 text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative lg:sticky lg:top-28 lg:col-span-4 lg:col-start-9 lg:self-start" data-reveal>
          <div
            data-orbit-spin="30"
            className="pointer-events-none absolute left-1/2 top-[42%] -z-0 w-[170%] -translate-x-1/2 -translate-y-1/2"
          >
            <OrbitRings className="h-auto w-full" />
          </div>
          <div className="relative">
            <Brackets />
            <div className="relative aspect-square overflow-hidden bg-ink-2">
              <div data-parallax="0.12" className="absolute -inset-y-[8%] inset-x-0">
                <Image
                  src="/images/headshot.webp"
                  alt="Portrait of Luke Horton"
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
          <p className="eyebrow relative mt-5 flex items-center gap-3">
            <span className="h-1.5 w-1.5 animate-[blink_1.6s_steps(2)_infinite] bg-accent" aria-hidden="true" />
            Long Beach, CA
          </p>
        </div>
      </div>
    </section>
  );
}
