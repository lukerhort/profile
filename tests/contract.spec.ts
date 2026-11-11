import { test, expect, waitForReady } from "./fixtures";

// Contract with the `site-improvements` branch: these are EXPECTED to fail until
// both branches are merged (hero CTAs, project cards, resume rename, TODO removal).
test.describe("contract with site-improvements (expected-pending)", () => {
  test("hero CTAs are linked and visible in the first viewport", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    const resume = page.locator('[data-testid="hero-cta-resume"]');
    const contact = page.locator('[data-testid="hero-cta-contact"]');
    await expect(resume).toHaveAttribute("href", "/Luke-Horton-Resume.pdf");
    await expect(contact).toHaveAttribute("href", "#contact");
    const vh = page.viewportSize()!.height;
    for (const el of [resume, contact]) {
      await expect(el).toBeVisible();
      const box = (await el.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(vh);
    }
  });

  test("projects: exactly 4 cards, each with 2+ images", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator('#projects [data-testid="project-card"]');
    await expect(cards).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      expect(await cards.nth(i).locator("img").count(), `card ${i}`).toBeGreaterThanOrEqual(2);
    }
  });

  test("Daedalus card links to its GitHub repo", async ({ page }) => {
    await page.goto("/");
    const card = page.locator('#projects [data-testid="project-card"]', { hasText: /daedalus/i });
    await expect(card).toHaveCount(1);
    await expect(card.locator('a[href="https://github.com/lukerhort/daedalus"]').first()).toHaveCount(1);
  });

  test('the text "TODO" appears nowhere in the rendered page', async ({ page }) => {
    await page.goto("/");
    const text = await page.evaluate(() => document.documentElement.textContent ?? "");
    expect(text).not.toContain("TODO");
  });

  test("/Luke-Horton-Resume.pdf returns 200", async ({ request }) => {
    const res = await request.get("/Luke-Horton-Resume.pdf");
    expect(res.status()).toBe(200);
  });
});
