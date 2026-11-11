import { test, expect, scrollThrough, waitForReady } from "./fixtures";

test.describe("assets and links", () => {
  test("every image loads and has alt text", async ({ page }) => {
    await page.goto("/");
    await waitForReady(page);
    await scrollThrough(page); // trigger lazy loading
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.currentSrc || i.src),
          ),
        { timeout: 15_000 },
      )
      .toEqual([]);
    const noAlt = await page.evaluate(() => [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.src));
    expect(noAlt).toEqual([]);
  });

  test("same-origin links and assets return 200; external links have noopener", async ({ page, request, baseURL }) => {
    await page.goto("/");
    await waitForReady(page);
    const { urls, external } = await page.evaluate(() => {
      const origin = location.origin;
      const same = new Set<string>();
      const external: { href: string; rel: string }[] = [];
      document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
        if (!/^https?:$/.test(a.protocol)) return;
        if (a.origin === origin) same.add(a.origin + a.pathname);
        else external.push({ href: a.href, rel: a.rel });
      });
      document.querySelectorAll<HTMLElement>("img[src], link[href], script[src], source[src], video[poster]").forEach((el) => {
        const raw = (el as HTMLImageElement).src || (el as HTMLLinkElement).href || el.getAttribute("poster");
        if (!raw) return;
        const u = new URL(raw, location.href);
        if (u.origin === origin) same.add(u.origin + u.pathname + u.search);
      });
      return { urls: [...same], external };
    });
    expect(urls.length).toBeGreaterThan(5);
    for (const url of urls) {
      const res = await request.get(url);
      expect(res.status(), url).toBe(200);
    }
    // The site's resume link specifically.
    const pdfs = urls.filter((u) => u.toLowerCase().endsWith(".pdf"));
    expect(pdfs.length, "a resume PDF link exists").toBeGreaterThan(0);
    expect(external.length).toBeGreaterThan(0);
    for (const l of external) expect(l.rel, l.href).toContain("noopener");
    expect(baseURL).toBeTruthy();
  });
});

test.describe("SEO", () => {
  test("canonical, Open Graph, Twitter, JSON-LD, sitemap and robots", async ({ page, request }) => {
    await page.goto("/");
    const meta = (sel: string, attr = "content") => page.locator(sel).first().getAttribute(attr);
    expect(await meta('link[rel="canonical"]', "href")).toBe("https://www.lukehorton.me/");
    expect(await meta('meta[property="og:title"]')).toContain("Luke Horton");
    expect((await meta('meta[property="og:description"]'))!.length).toBeGreaterThan(50);
    expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(await meta('meta[name="twitter:image"]')).toContain("/og.png");

    const ogImage = (await meta('meta[property="og:image"]'))!;
    expect(ogImage).toContain("/og.png");
    expect(await meta('meta[property="og:image:width"]')).toBe("1200");
    expect(await meta('meta[property="og:image:height"]')).toBe("630");
    expect((await meta('meta[property="og:image:alt"]'))!.length).toBeGreaterThan(3);
    // Production URL points at the live domain; fetch the same path locally.
    const res = await request.get(new URL(ogImage).pathname);
    expect(res.status()).toBe(200);
    const buf = await res.body();
    expect(buf.subarray(1, 4).toString()).toBe("PNG");
    expect([buf.readUInt32BE(16), buf.readUInt32BE(20)]).toEqual([1200, 630]);
    expect(buf.length).toBeLessThan(300 * 1024);

    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const person = ld.map((t) => JSON.parse(t)).find((j) => j["@type"] === "Person");
    expect(person, "Person JSON-LD").toBeTruthy();
    expect(person["@context"]).toBe("https://schema.org");
    expect(person.name).toBe("Luke Horton");
    expect(person.jobTitle).toBeTruthy();
    expect(person.worksFor.name).toBe("True Anomaly");
    expect(person.alumniOf.name).toBe("San Diego State University");
    expect(person.url).toBe("https://www.lukehorton.me");
    expect(person.sameAs).toEqual(expect.arrayContaining([expect.stringContaining("linkedin.com"), expect.stringContaining("github.com")]));
    expect(person.image).toContain("/og.png");

    const sm = await request.get("/sitemap.xml");
    expect(sm.status()).toBe(200);
    const smText = await sm.text();
    expect(smText).toContain("<urlset");
    expect(smText).toContain("https://www.lukehorton.me/");
    const rb = await request.get("/robots.txt");
    expect(rb.status()).toBe(200);
    const rbText = await rb.text();
    expect(rbText).toMatch(/User-Agent:\s*\*/i);
    expect(rbText).toContain("Sitemap: https://www.lukehorton.me/sitemap.xml");
  });
});

test.describe("analytics", () => {
  async function stubGtag(page: import("@playwright/test").Page) {
    await page.goto("/");
    await waitForReady(page);
    // The page's own gtag-init defines window.gtag after hydration; override it afterwards.
    await page.waitForFunction(() => typeof (window as any).gtag === "function");
    await page.evaluate(() => {
      (window as any).__events = [];
      (window as any).gtag = (...args: unknown[]) => (window as any).__events.push(args);
      // Never actually navigate away; registered after Analytics' capture listener.
      document.addEventListener("click", (e) => e.preventDefault(), true);
    });
  }
  const events = (page: import("@playwright/test").Page) => page.evaluate(() => (window as any).__events as unknown[][]);

  test("resume, project, contact and outbound clicks fire gtag events", async ({ page }) => {
    await stubGtag(page);
    await page.locator('a[href$=".pdf"]').first().evaluate((el) => (el as HTMLElement).click());
    await page.locator('#projects a[href^="https://"]').first().evaluate((el) => (el as HTMLElement).click());
    await page.locator('#contact a[href^="mailto:"]').first().evaluate((el) => (el as HTMLElement).click());
    await page.locator('#contact a[href*="linkedin.com"]').first().evaluate((el) => (el as HTMLElement).click());
    const ev = await events(page);
    const names = ev.map((e) => e[1]);
    expect(names).toEqual(["resume_download", "project_click", "contact_click", "contact_click"]);
    expect((ev[1][2] as { link_url: string }).link_url).toMatch(/^https:\/\//);
  });

  test("no-ops safely when gtag is undefined", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await waitForReady(page);
    await page.evaluate(() => {
      delete (window as any).gtag;
      document.addEventListener("click", (e) => e.preventDefault(), true);
    });
    await page.locator('a[href$=".pdf"]').first().evaluate((el) => (el as HTMLElement).click());
    expect(errors).toEqual([]);
  });
});
