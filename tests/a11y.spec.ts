import AxeBuilder from "@axe-core/playwright";
import { test, expect, scrollThrough, waitForReady } from "./fixtures";

test("accessibility smoke: no serious or critical axe violations", async ({ page }) => {
  await page.goto("/");
  await waitForReady(page);
  await scrollThrough(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  // Let reveal tweens settle so contrast is measured on final colours.
  await page.waitForTimeout(1500);
  const results = await new AxeBuilder({ page }).analyze();
  const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const summary = bad.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length} nodes) e.g. ${v.nodes[0]?.target.join(" ")}`);
  expect(summary).toEqual([]);
});
