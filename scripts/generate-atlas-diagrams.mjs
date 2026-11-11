// Draws the two ATLAS diagrams shown on the site (public/images/atlas-*.webp) by
// rendering HTML with Playwright. Diagrams, not screenshots: the real app shows personal data.
// Usage: node scripts/generate-atlas-diagrams.mjs   (needs network for Google Fonts)
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = 1400;
const H = 1050;

const head = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:${W}px;height:${H}px;background:#0e0c0a;color:#f4f1ec;font-family:'JetBrains Mono',monospace;padding:64px 72px;position:relative;
  background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 70px),repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 70px)}
.k{font-size:20px;letter-spacing:.22em;text-transform:uppercase;color:#a39e97}
.k b{color:#ff8a3d;font-weight:500}
.n{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:46px;letter-spacing:.03em;text-transform:uppercase;line-height:1}
.d{font-size:21px;line-height:1.45;color:#a39e97;margin-top:10px}
.box{border:1.5px solid rgba(244,241,236,.28);background:#060504;padding:24px 28px}
.hot{border-color:#f26b1d}
.row{display:flex;gap:24px}
.row>*{flex:1}
.arrow{color:#ff8a3d;font-size:20px;letter-spacing:.18em;text-transform:uppercase}
</style></head><body>`;

const architecture = `${head}
<div class="k"><b>ATLAS</b> // system block diagram</div>
<div style="display:flex;gap:40px;margin-top:40px;height:${H - 64 * 2 - 64}px">
  <div style="width:330px;display:flex;flex-direction:column;justify-content:center;gap:26px">
    <div class="box hot"><div class="n">Phone app</div><div class="d">My day, missions, approvals</div></div>
    <div class="arrow">goals &rarr;</div>
    <div class="arrow">&larr; approvals</div>
  </div>
  <div class="box" style="flex:1;display:flex;flex-direction:column;gap:22px;border-style:dashed">
    <div class="k">Server on my PC &middot; one Node.js process</div>
    <div class="box"><div class="n">Chief agent</div><div class="d">The one I talk to. Starts and steers goals.</div></div>
    <div class="box hot"><div class="n">Orchestrator</div><div class="d">Plan &rarr; task graph &rarr; parallel agents &rarr; review &rarr; replan</div></div>
    <div class="row">
      <div class="box"><div class="n">Models</div><div class="d">Claude, GPT, Grok, Gemini</div></div>
      <div class="box"><div class="n">Tools</div><div class="d">Files, shell, web, mail, calendar</div></div>
    </div>
    <div class="box"><div class="n">SQLite</div><div class="d">Goals, tasks, events, approvals. Survives a restart.</div></div>
  </div>
</div></body></html>`;

const step = (n, name, text, hot = false) =>
  `<div class="box ${hot ? "hot" : ""}" style="display:flex;gap:28px;align-items:center"><div class="n" style="color:#ff8a3d;width:70px">${n}</div><div><div class="n">${name}</div><div class="d">${text}</div></div></div>`;

const mission = `${head}
<div class="k"><b>ATLAS</b> // how a goal runs</div>
<div style="display:flex;flex-direction:column;gap:18px;margin-top:40px">
  ${step("01", "Goal", "I type or say what I want done.")}
  ${step("02", "Plan", "The orchestrator breaks the goal into a graph of tasks.")}
  ${step("03", "Agents", "Researcher, coder, writer and analyst agents run the tasks in parallel.")}
  ${step("04", "Review", "Results are checked. Weak ones go back for another pass.")}
  ${step("05", "Approval", "Anything risky stops and asks me on my phone first.", true)}
  ${step("06", "Report", "The finished work is saved and I get a notification.")}
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [name, html] of [
  ["atlas-architecture", architecture],
  ["atlas-mission", mission],
]) {
  await page.setContent(html, { waitUntil: "networkidle" }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  const out = path.join(root, "public", "images", `${name}.webp`);
  const info = await sharp(png).webp({ quality: 82, effort: 6 }).toFile(out);
  console.log(`${name}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB`);
}
await browser.close();
