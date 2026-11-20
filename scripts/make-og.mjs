/**
 * Render `public/og.png` (1200×630) from `scripts/og-card.html`.
 *
 * The card is real HTML with the site's own fonts and colours, so the social
 * preview matches the page instead of being a hand-drawn approximation.
 * Run after changing the card: `node scripts/make-og.mjs`.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const project = resolve(import.meta.dirname, "..");
const card = resolve(project, "scripts/og-card.html");
const out = resolve(project, "public/og.png");

const chrome =
  process.env.CHROME_PATH ??
  ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(
    existsSync,
  );
if (!chrome) {
  console.error("No Chrome found. Set CHROME_PATH.");
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: ["--no-sandbox", "--font-render-hinting=none"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.goto(`file://${card}`, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(`wrote ${out}`);
} finally {
  await browser.close();
}
