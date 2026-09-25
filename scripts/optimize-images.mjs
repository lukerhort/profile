// Generates web-sized WebP copies of the source photos in public/Photos
// into public/images. Originals are left untouched. Run: node scripts/optimize-images.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const jobs = [
  { src: "Headshot-TrueAnomaly.png", out: "headshot.webp", width: 900 },
  { src: "AlebornePlane.png", out: "aleborne.webp", width: 1400 },
  { src: "DesignDay2.jpg", out: "barrelborne.webp", width: 1400 },
  { src: "DaedalusLogov1.png", out: "daedalus.webp", width: 900 },
];

mkdirSync("public/images", { recursive: true });
for (const { src, out, width } of jobs) {
  const info = await sharp(`public/Photos/${src}`)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(`public/images/${out}`);
  console.log(`${out}: ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}
