import { readStorageJSON, writeStorageJSON } from "@/lib/storage";

export interface SeoMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  keywords: string;
}

export const DEFAULT_SEO_META: SeoMeta = {
  title: "younggam",
  description: "생각을 확장하고 깊이 탐구하는 영감 연구소",
  ogTitle: "younggam",
  ogDescription: "생각을 확장하고 깊이 탐구하는 영감 연구소",
  keywords: "",
};

const SEO_KEY = "seo_meta";

const setMetaContent = (selector: string, value: string) => {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute("content", value);
  }
};

export const applySeoMeta = (seo: SeoMeta) => {
  document.title = seo.title;
  setMetaContent('meta[name="description"]', seo.description);
  setMetaContent('meta[property="og:title"]', seo.ogTitle);
  setMetaContent('meta[property="og:description"]', seo.ogDescription);
  setMetaContent('meta[name="twitter:title"]', seo.ogTitle);
  setMetaContent('meta[name="twitter:description"]', seo.ogDescription);

  if (!seo.keywords) {
    return;
  }

  let keywordsMeta = document.querySelector('meta[name="keywords"]');
  if (!keywordsMeta) {
    keywordsMeta = document.createElement("meta");
    keywordsMeta.setAttribute("name", "keywords");
    document.head.appendChild(keywordsMeta);
  }
  keywordsMeta.setAttribute("content", seo.keywords);
};

export const loadSeoMeta = () => readStorageJSON<SeoMeta>(SEO_KEY, DEFAULT_SEO_META);

export const saveSeoMeta = (seo: SeoMeta) => {
  writeStorageJSON(SEO_KEY, seo);
};
