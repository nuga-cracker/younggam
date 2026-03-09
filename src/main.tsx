import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply saved SEO meta tags on load
const savedSeo = localStorage.getItem("seo_meta");
if (savedSeo) {
  try {
    const seo = JSON.parse(savedSeo);
    if (seo.title) document.title = seo.title;
    const setMeta = (sel: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute("content", val);
    };
    if (seo.description) setMeta('meta[name="description"]', seo.description);
    if (seo.ogTitle) { setMeta('meta[property="og:title"]', seo.ogTitle); setMeta('meta[name="twitter:title"]', seo.ogTitle); }
    if (seo.ogDescription) { setMeta('meta[property="og:description"]', seo.ogDescription); setMeta('meta[name="twitter:description"]', seo.ogDescription); }
    if (seo.keywords) {
      let kw = document.querySelector('meta[name="keywords"]');
      if (!kw) { kw = document.createElement("meta"); kw.setAttribute("name", "keywords"); document.head.appendChild(kw); }
      kw.setAttribute("content", seo.keywords);
    }
  } catch (e) {}
}

createRoot(document.getElementById("root")!).render(<App />);
