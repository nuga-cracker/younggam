import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { applySeoMeta, loadSeoMeta } from "@/lib/seo";

applySeoMeta(loadSeoMeta());

createRoot(document.getElementById("root")!).render(<App />);
