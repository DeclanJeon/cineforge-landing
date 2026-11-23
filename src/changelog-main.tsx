import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/base.css";
import "./styles/sections.css";
import "./styles/sections-b.css";
import "./styles/changelog.css";

import ChangelogPage from "./ChangelogPage";
import { applyDocumentMeta, dict } from "./i18n";
import { initAnalytics } from "./lib/analytics";

applyDocumentMeta(dict, "changelog");
initAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChangelogPage />
  </StrictMode>,
);
