import { education, skills } from "@/lib/content";
import SectionHeading from "./SectionHeading";

export default function Education() {
  return (
    <section id="education" className="relative border-t border-line py-28 md:py-44">
      <div className="container-x">
        <div data-reveal-group>
          <SectionHeading index="04" label="Education & Skills" title="Foundation" />
        </div>

        <div className="mt-16 grid gap-12 border-t border-line pt-12 lg:grid-cols-12" data-reveal-group>
          <div className="lg:col-span-5" data-reveal>
            <p className="eyebrow">{education.date}</p>
            <h3 className="display mt-4 text-[clamp(2.25rem,4.5vw,3.75rem)]">{education.degree}</h3>
            <p className="mt-3 text-lg text-fg/80">{education.school}</p>
            {/* TODO(Luke): add GPA, honors, or awards in lib/content.ts -> education if you want them shown. */}
          </div>
          <div className="lg:col-span-4 lg:col-start-7" data-reveal>
            <p className="eyebrow text-accent">Relevant coursework</p>
            <ul className="mt-5 space-y-2.5 text-fg/75">
              {education.coursework.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2 lg:col-start-11" data-reveal>
            <p className="eyebrow text-accent">Certifications</p>
            <ul className="mt-5 space-y-2.5 text-fg/75">
              {education.certifications.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-20 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
          data-reveal-group
        >
          {skills.map((g) => (
            <div key={g.group} className="bg-ink p-7" data-reveal>
              <h3 className="eyebrow text-fg">{g.group}</h3>
              <ul className="mt-5 space-y-2 text-sm text-fg/65">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
