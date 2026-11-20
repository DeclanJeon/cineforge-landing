/**
 * Render the static assets that must look exactly like the site:
 *   public/og.png               1200×630 social card  (scripts/og-card.html)
 *   public/apple-touch-icon.png 180×180 icon          (public/favicon.svg)
 *
 * Both are screenshots of real HTML/SVG in the site's own fonts and colours, so
 * they never drift from the page. Run after editing either source: `npm run assets`.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const project = resolve(import.meta.dirname, "..");

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
  // social card
  const card = await browser.newPage();
  await card.setViewport({ width: 1200, height: 630 });
  await card.goto(`file://${resolve(project, "scripts/og-card.html")}`, {
    waitUntil: "networkidle0",
  });
  await card.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 400));
  await card.screenshot({
    path: resolve(project, "public/og.png"),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  await card.close();
  console.log("wrote public/og.png");

  // iOS home-screen icon from the same mark the favicon uses
  const icon = await browser.newPage();
  await icon.setViewport({ width: 180, height: 180 });
  await icon.goto(`file://${resolve(project, "public/favicon.svg")}`, {
    waitUntil: "networkidle0",
  });
  await new Promise((r) => setTimeout(r, 200));
  await icon.screenshot({ path: resolve(project, "public/apple-touch-icon.png") });
  await icon.close();
  console.log("wrote public/apple-touch-icon.png");
} finally {
  await browser.close();
}
