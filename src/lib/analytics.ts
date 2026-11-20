/**
 * Cloudflare Web Analytics — cookieless page views and visitors.
 * The beacon only loads when a token is provided at build time
 * (`VITE_CF_BEACON`), so local previews never report.
 */
const TOKEN = import.meta.env.VITE_CF_BEACON;

export function initAnalytics() {
  if (!TOKEN || document.querySelector("script[data-cf-beacon]")) return;

  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.setAttribute("data-cf-beacon", JSON.stringify({ token: TOKEN }));
  document.head.appendChild(script);
}
