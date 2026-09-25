import { existsSync } from "node:fs";
import path from "node:path";
import Motion from "@/components/Motion";
import Nav from "@/components/Nav";
import Hero, { type HeroMedia } from "@/components/Hero";
import HeroBackdrop from "@/components/HeroBackdrop";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Education from "@/components/Education";
import Leadership from "@/components/Leadership";
import Contact from "@/components/Contact";
import OrbitHud from "@/components/OrbitHud";

/**
 * Hero media is picked up automatically at build time from public/media:
 *   hero.webm / hero.mp4  -> background video (muted loop)
 *   hero.jpg              -> poster frame, or a still hero if there is no video
 * With none present, the built-in starfield placeholder is used.
 */
function findHeroMedia(): HeroMedia {
  const dir = path.join(process.cwd(), "public", "media");
  const has = (f: string) => existsSync(path.join(dir, f));
  const video = ["hero.webm", "hero.mp4"].filter(has).map((f) => `/media/${f}`);
  return {
    video: video.length ? video : undefined,
    poster: has("hero.jpg") ? "/media/hero.jpg" : undefined,
  };
}

export default function Home() {
  return (
    <Motion>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-fg focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <Nav />
      <OrbitHud />
      <main>
        <Hero media={findHeroMedia()} backdrop={<HeroBackdrop />} />
        <About />
        <Experience />
        <Projects />
        <Education />
        <Leadership />
        <Contact />
      </main>
    </Motion>
  );
}
