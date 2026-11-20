import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/base.css";
import "./styles/hero.css";
import "./styles/sections.css";
import "./styles/sections-b.css";

import App from "./App";
import { applyDocumentMeta, dict } from "./i18n";
import { initAnalytics } from "./lib/analytics";

applyDocumentMeta(dict);
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
