"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Project, ProjectImage } from "@/lib/content";
import Brackets from "./Brackets";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const pad = (n: number) => String(n).padStart(2, "0");

function fitClass(img: ProjectImage) {
  if (img.fit !== "contain") return "object-cover";
  return img.pad === "tight" ? "object-contain p-[5%]" : "object-contain p-[12%]";
}

/**
 * Project image viewer styled as a mission dossier: a fixed 4:3 frame with
 * every image stacked inside it (only the active one is shown), a dossier
 * strip, and a thumbnail strip that swaps the image. All images are in the
 * HTML, so nothing shifts when switching and the first image still shows if
 * JavaScript never runs.
 *
 * With motion allowed, the frame starts as a dark crimson duotone; when it
 * reaches the middle of the viewport a scan line wipes down it, restoring
 * full colour behind the line. The duotone is
 * only applied under `html.motion-ready` (see globals.css), so no-JS, a failed
 * bundle and reduced motion all get full colour.
 */
export default function ProjectGallery({
  project,
  index,
  className = "",
}: {
  project: Project;
  index: number;
  className?: string;
}) {
  const images = [project.image, ...project.gallery];
  const [active, setActive] = useState(0);
  const current = images[active];
  const frame = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = frame.current!;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: el,
          // Clears as the frame reaches the middle of the viewport.
          start: "center 58%",
          once: true,
          onEnter: () => el.classList.add("is-clear"),
        });
        return () => st.kill();
      });
    },
    { scope: frame },
  );

  return (
    <figure className={className} data-reveal>
      <div ref={frame} data-dossier className="dossier-frame group relative aspect-[4/3] overflow-hidden">
        <div data-parallax="0.1" className="absolute -inset-y-[6%] inset-x-0">
          {images.map((img, i) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              aria-hidden={i === active ? undefined : true}
              className={`dossier-img ${img.tone === "light" ? "tone-light" : ""} ${fitClass(img)} ${i === active ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
        <span className="dossier-vignette" aria-hidden="true" />
        <span className="dossier-mono" aria-hidden="true" />
        <span className="dossier-tint" aria-hidden="true" />
        <span className="dossier-scan" aria-hidden="true" />
        <Brackets inset="12px" adaptive className="dossier-brackets z-10" />
      </div>

      {/* Dossier strip: built only from the project's own data (the course tag is shown once, beside the title). */}
      <p className="dossier-strip">
        <span className="text-fg">PRJ-{pad(index + 1)}</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${project.status === "Complete" ? "bg-emerald-400" : "bg-amber-400"}`}
            aria-hidden="true"
          />
          Status: {project.status}
        </span>
      </p>

      <figcaption className="eyebrow mt-4 flex items-baseline gap-3" aria-live="polite">
        <span className="text-accent">
          {pad(active + 1)} / {pad(images.length)}
        </span>
        <span className="text-fg/70">{current.caption}</span>
      </figcaption>

      <ul className="mt-4 grid grid-cols-4 gap-2 sm:gap-3" aria-label={`${project.name} images`}>
        {images.map((img, i) => (
          <li key={img.src}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`Show image ${i + 1} of ${images.length}: ${img.caption}`}
              className={`relative block aspect-[4/3] w-full overflow-hidden border bg-ink-2 transition-[border-color,opacity] duration-300 ${
                i === active ? "border-accent opacity-100" : "border-line opacity-55 hover:opacity-100"
              }`}
            >
              <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 12vw, 25vw" className={fitClass(img)} />
            </button>
          </li>
        ))}
      </ul>
    </figure>
  );
}
