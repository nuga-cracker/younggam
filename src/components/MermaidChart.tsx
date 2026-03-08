import { useEffect, useRef } from "react";
import mermaid from "mermaid";

const PASTEL_COLORS = [
  "#D4E4F7", "#FAD9E0", "#D9F5E8", "#FFF0D6",
  "#E0D6F0", "#FFE8D9", "#D9ECF5", "#F0DEF4",
  "#E1E5F4", "#FAE3DE",
];

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    primaryColor: "#A7C7E7",
    lineColor: "#94A3B8",
    fontSize: "15px",
    fontFamily: "'Pretendard', system-ui, -apple-system, sans-serif",
  },
  mindmap: {
    padding: 16,
  },
});

interface MermaidChartProps {
  keyword: string;
  thoughts: string[];
}

const MermaidChart = ({ keyword, thoughts }: MermaidChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = async () => {
      if (!containerRef.current) return;

      const esc = (s: string) => s.replace(/[()[\]{}"`]/g, " ").trim();
      const lines = thoughts.map((t) => `    ${esc(t)}`);
      const chart = `mindmap
  root((${esc(keyword)}))
${lines.join("\n")}`;

      try {
        containerRef.current.innerHTML = "";
        const id = "mindmap-" + Date.now();
        const { svg } = await mermaid.render(id, chart);
        containerRef.current.innerHTML = svg;

        // Style the SVG
        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.style.maxWidth = "100%";
          svgEl.style.height = "auto";
        }

        // Apply colors to nodes
        const nodes = containerRef.current.querySelectorAll<SVGElement>(
          ".mindmap-node > .node-bkg"
        );
        nodes.forEach((node, i) => {
          const color = PASTEL_COLORS[i % PASTEL_COLORS.length];
          node.style.fill = color;
          node.style.stroke = "none";
          node.style.filter = "drop-shadow(0 2px 8px rgba(0,0,0,0.08))";
          node.setAttribute("rx", "12");
          node.setAttribute("ry", "12");
        });

        // Style text
        const texts = containerRef.current.querySelectorAll<SVGTextElement>(
          ".mindmap-node text"
        );
        texts.forEach((text) => {
          text.style.fill = "#1E293B";
          text.style.fontWeight = "700";
          text.style.fontSize = "15px";
        });

        // Style root text
        const rootText = containerRef.current.querySelector<SVGTextElement>(
          ".mindmap-node:first-child text"
        );
        if (rootText) {
          rootText.style.fill = "#1E293B";
          rootText.style.fontWeight = "700";
          rootText.style.fontSize = "16px";
        }

        // Color section lines
        const edges = containerRef.current.querySelectorAll<SVGElement>(
          ".section-root > path, .edge"
        );
        edges.forEach((el) => {
          el.style.stroke = "#CBD5E1";
          el.style.strokeWidth = "2";
        });
      } catch {
        containerRef.current.innerHTML =
          '<p class="text-muted-foreground text-sm">마인드맵을 렌더링할 수 없습니다.</p>';
      }
    };
    render();
  }, [keyword, thoughts]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center w-full overflow-auto py-4"
    />
  );
};

export default MermaidChart;
