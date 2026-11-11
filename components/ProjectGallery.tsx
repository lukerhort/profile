"use client";

import { useState } from "react";
import Image from "next/image";
import type { Project, ProjectImage } from "@/lib/content";
import Brackets from "./Brackets";

const pad = (n: number) => String(n).padStart(2, "0");

function fitClass(img: ProjectImage) {
  return img.fit === "contain" ? "object-contain p-[12%]" : "object-cover";
}

/**
 * Project image viewer: a fixed 4:3 frame with every image stacked inside it
 * (only the active one is shown) plus a thumbnail strip that swaps it. All
 * images are in the HTML, so nothing shifts when switching and the first image
 * still shows if JavaScript never runs.
 */
export default function ProjectGallery({ project, className = "" }: { project: Project; className?: string }) {
  const images = [project.image, ...project.gallery];
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <figure className={className} data-reveal>
      <div className="group relative aspect-[4/3] overflow-hidden bg-ink-2">
        <div data-parallax="0.1" className="absolute -inset-y-[6%] inset-x-0">
          {images.map((img, i) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              aria-hidden={i === active ? undefined : true}
              className={`transition-[opacity,scale] duration-700 ease-(--ease-out-expo) group-hover:scale-[1.03] ${fitClass(img)} ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
        <Brackets inset="12px" className="z-10 opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="eyebrow absolute left-7 top-7 z-10 flex items-center gap-2 bg-ink/70 px-3 py-1.5 text-fg/80 backdrop-blur">
          <span
            className={`h-1.5 w-1.5 rounded-full ${project.status === "Complete" ? "bg-emerald-400" : "bg-amber-400"}`}
            aria-hidden="true"
          />
          {project.status}
        </span>
      </div>

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
