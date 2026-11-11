// Regenerates public/og.png (1200x630) by rendering an HTML card with Playwright.
// Usage: node scripts/generate-og.mjs   (needs network for Google Fonts; falls back to system fonts)
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const content = readFileSync(path.join(root, "lib", "content.ts"), "utf8");
const pick = (key) => content.match(new RegExp(`\\b${key}:\\s*"([^"]+)"`))?.[1];
const name = pick("name").toUpperCase();
const title = pick("title");
const company = pick("company");
const city = pick("city");
const headshot = readFileSync(path.join(root, "public", "images", "headshot.webp")).toString("base64");

const bracket = (pos) => `<i class="b ${pos}"></i>`;
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#060504;color:#f4f1ec;position:relative;overflow:hidden;font-family:'JetBrains Mono',monospace}
.glow{position:absolute;right:-180px;top:-120px;width:900px;height:900px;background:radial-gradient(circle,rgba(242,107,29,.07),transparent 55%)}
.ring{position:absolute;border:1px solid rgba(255,255,255,.10);border-radius:50%}
.r1{width:760px;height:760px;right:-120px;top:-65px}
.r2{width:560px;height:560px;right:-20px;top:35px;border-color:rgba(242,107,29,.45)}
.dot{position:absolute;width:12px;height:12px;border-radius:50%;background:#f26b1d;box-shadow:0 0 18px #f26b1d;right:236px;top:-30px}
.photo{position:absolute;right:80px;top:85px;width:460px;height:460px;border-radius:50%;overflow:hidden;border:2px solid rgba(242,107,29,.8)}
.photo img{width:100%;height:100%;object-fit:cover;object-position:50% 20%}
.b{position:absolute;width:40px;height:40px;border:0 solid #f26b1d}
.tl{left:36px;top:36px;border-width:2px 0 0 2px}.tr{right:36px;top:36px;border-width:2px 2px 0 0}
.bl{left:36px;bottom:36px;border-width:0 0 2px 2px}.br{right:36px;bottom:36px;border-width:0 2px 2px 0}
.copy{position:absolute;left:90px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center}
.eyebrow{font-size:18px;letter-spacing:.28em;color:#f26b1d;text-transform:uppercase;margin-bottom:26px;display:flex;align-items:center;gap:16px}
.eyebrow:after{content:"";width:60px;height:1px;background:rgba(255,255,255,.25)}
h1{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:150px;line-height:.88;letter-spacing:.01em}
.t{font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:600;font-size:44px;letter-spacing:.16em;text-transform:uppercase;margin-top:26px;color:rgba(242,242,243,.85)}
.l{font-size:20px;letter-spacing:.14em;color:#a39e97;margin-top:22px;text-transform:uppercase}
</style></head><body>
<div class="glow"></div><div class="ring r1"></div><div class="ring r2"></div><div class="dot"></div>
<div class="photo"><img src="data:image/webp;base64,${headshot}"></div>
${["tl", "tr", "bl", "br"].map(bracket).join("")}
<div class="copy"><div class="eyebrow">Portfolio</div><h1>${name}</h1><div class="t">${title}</div><div class="l">${company} &middot; ${city}</div></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" }).catch(() => {});
await page.evaluate(() => document.fonts.ready);
const out = path.join(root, "public", "og.png");
const shot = await page.screenshot({ type: "png" });
// Palette PNG keeps the card under the 300 KB budget the tests enforce.
await sharp(shot).png({ palette: true, quality: 92, compressionLevel: 9 }).toFile(out);
await browser.close();
console.log(`wrote ${out} (${(statSync(out).size / 1024).toFixed(0)} KB)`);


