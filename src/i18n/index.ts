import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

import { en } from "./en";
import { ko, type Dict } from "./ko";

export type { Dict };

export type Lang = "ko" | "en";

/** Korean keeps the root path; English lives under /en/ (its own index.html). */
export const LANG_PATH: Record<Lang, string> = { ko: "/", en: "/en/" };

export function langFromPath(path: string): Lang {
  return /^\/en(\/|$)/.test(path) ? "en" : "ko";
}

const initialLang: Lang =
  typeof window === "undefined" ? "ko" : langFromPath(window.location.pathname);

void i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: initialLang,
  fallbackLng: "ko",
  supportedLngs: ["ko", "en"],
  interpolation: { escapeValue: false },
  returnNull: false,
});

export const lang: Lang = initialLang;

/** The active dictionary, for one-off reads outside React (document meta). */
export const dict: Dict = initialLang === "en" ? en : ko;

/** The whole dictionary for the active language, typed against the Korean source. */
export function useDict(): Dict {
  const { i18n: instance } = useTranslation();
  return instance.resolvedLanguage === "en" ? en : ko;
}

function setMeta(selector: string, attribute: string, value: string) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attribute, value);
}

/** Title, description and social cards follow the active language. */
export function applyDocumentMeta(dict: Dict) {
  document.documentElement.lang = lang;
  document.title = dict.meta.title;
  setMeta('meta[name="description"]', "content", dict.meta.description);
  setMeta('meta[property="og:title"]', "content", dict.meta.ogTitle);
  setMeta('meta[property="og:description"]', "content", dict.meta.ogDescription);
  setMeta('meta[name="twitter:title"]', "content", dict.meta.ogTitle);
  setMeta('meta[name="twitter:description"]', "content", dict.meta.ogDescription);
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) {
    canonical.href = `https://cineforge.pages.dev${LANG_PATH[lang]}`;
  }
}

export { i18n };
