import { leadership } from "@/lib/content";
import SectionHeading from "./SectionHeading";

export default function Leadership() {
  return (
    <section id="leadership" className="relative border-t border-line py-28 md:py-44">
      <div className="container-x grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5" data-reveal-group>
          <SectionHeading index="05" label="Leadership" title="Beyond engineering" />
          <dl className="mt-12 flex gap-12">
            {leadership.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse" data-reveal>
                <dt className="eyebrow mt-2">{s.label}</dt>
                <dd className="display text-6xl text-fg md:text-7xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="divide-y divide-line border-y border-line lg:col-span-6 lg:col-start-7" data-reveal-group>
          {leadership.items.map((item) => (
            <article key={item.title} className="py-8" data-reveal>
              <h3 className="display text-3xl md:text-4xl">{item.title}</h3>
              <p className="eyebrow mt-2 text-accent">{item.meta}</p>
              <p className="mt-4 leading-relaxed text-fg/65">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
