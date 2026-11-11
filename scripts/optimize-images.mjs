// Generates web-sized WebP copies of the source photos in assets/photos
// (not deployed) into public/images. Originals are left untouched.
// Run: node scripts/optimize-images.mjs
//
// `sharp` is not a direct dependency: it is installed with Next.js (which uses
// it for image optimisation), so it resolves from node_modules after `npm ci`.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const MAIN = 1400; // primary project images
const GALLERY = 1000; // gallery images (also used for the thumbnails)
const BUDGET_KB = 150;

// `crop` (0 = top, 1 = bottom): portrait phone photos are cropped to the 4:3
// frame they are shown in, keeping that vertical focus point in view.
const jobs = [
  { src: "Headshot-TrueAnomaly.png", out: "headshot.webp", width: 900, quality: 80 },

  // Aleborne
  { src: "AlebornePlane.png", out: "aleborne.webp", width: MAIN, quality: 80 },
  { src: "Aleborne5.png", out: "aleborne-layout.webp", width: GALLERY, quality: 80 },
  { src: "Aleborne2.png", out: "aleborne-profile.webp", width: GALLERY, quality: 80 },

  // Barrelborne
  { src: "DesignDay2.jpg", out: "barrelborne.webp", width: 1200, quality: 62 },
  { src: "BarrelborneAvionics.jpg", out: "barrelborne-avionics.webp", width: GALLERY, crop: 0.78 },
  { src: "BarrelbornePowerHarness.jpg", out: "barrelborne-power-harness.webp", width: GALLERY, crop: 0.4, quality: 58 },
  { src: "BarrelborneAssembly.jpg", out: "barrelborne-assembly.webp", width: GALLERY, crop: 0.55, quality: 60 },

  // Daedalus
  { src: "DaedalusLogov1.png", out: "daedalus.webp", width: 900, quality: 80 },
  { src: "DaedalusBreadboard.jpg", out: "daedalus-breadboard.webp", width: GALLERY, crop: 0.85 },
];

mkdirSync("public/images", { recursive: true });
for (const { src, out, width, quality = 75, crop } of jobs) {
  // Bake EXIF orientation first so the crop maths sees upright pixels.
  const upright = await sharp(`assets/photos/${src}`).rotate().toBuffer({ resolveWithObject: true });
  let img = sharp(upright.data);
  if (crop !== undefined) {
    const { width: w, height: h } = upright.info;
    const ch = Math.min(h, Math.round((w * 3) / 4));
    img = img.extract({ left: 0, top: Math.round((h - ch) * crop), width: w, height: ch });
  }
  const info = await img
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(`public/images/${out}`);
  const kb = info.size / 1024;
  console.log(`${out}: ${info.width}x${info.height} ${kb.toFixed(0)} KB${kb > BUDGET_KB ? "  (over budget)" : ""}`);
}
