import { useEffect, useRef } from "react";
import mermaid from "mermaid";

const PASTEL_COLORS = [
  "#FFD6E0", "#FFE4C9", "#FFF3BF", "#D4F5D4",
  "#C9E4FF", "#E0D4FF", "#FFD4F1", "#D4F5F5",
  "#F5E6D0", "#E8F5C9",
];

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    primaryColor: PASTEL_COLORS[0],
    lineColor: "#CBD5E1",
    fontSize: "14px",
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

        // Apply random pastel colors to nodes
        const nodes = containerRef.current.querySelectorAll<SVGElement>(
          ".mindmap-node > .node-bkg"
        );
        nodes.forEach((node, i) => {
          const color = PASTEL_COLORS[i % PASTEL_COLORS.length];
          node.style.fill = color;
          node.style.stroke = color;
        });

        // Also color section lines
        const sections = containerRef.current.querySelectorAll<SVGElement>(
          ".section-root > path, .edge"
        );
        sections.forEach((el) => {
          el.style.stroke = "#CBD5E1";
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
      className="flex justify-center w-full overflow-auto mindmap-container"
    />
  );
};

export default MermaidChart;
