import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  mindmap: { useMaxWidth: true },
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
      const escapedKeyword = keyword.replace(/[()[\]{}]/g, " ");
      const lines = thoughts.map((t) => {
        const escaped = t.replace(/[()[\]{}]/g, " ");
        return `    ${escaped}`;
      });
      const chart = `mindmap
  root((${escapedKeyword}))
${lines.join("\n")}`;

      try {
        containerRef.current.innerHTML = "";
        const { svg } = await mermaid.render("mindmap-svg", chart);
        containerRef.current.innerHTML = svg;
      } catch {
        containerRef.current.innerHTML =
          '<p class="text-muted-foreground text-sm">마인드맵을 렌더링할 수 없습니다.</p>';
      }
    };
    render();
  }, [keyword, thoughts]);

  return <div ref={containerRef} className="flex justify-center w-full overflow-auto" />;
};

export default MermaidChart;
