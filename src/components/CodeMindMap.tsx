import { useMemo } from "react";

interface CodeMindMapProps {
  keyword: string;
  thoughts: string[];
}

const NODE_COLORS = [
  { bg: "hsl(210, 60%, 92%)", border: "hsl(210, 50%, 72%)", text: "hsl(210, 40%, 30%)" },
  { bg: "hsl(340, 60%, 92%)", border: "hsl(340, 50%, 72%)", text: "hsl(340, 40%, 30%)" },
  { bg: "hsl(150, 50%, 90%)", border: "hsl(150, 40%, 65%)", text: "hsl(150, 35%, 28%)" },
  { bg: "hsl(35, 70%, 90%)",  border: "hsl(35, 55%, 65%)",  text: "hsl(35, 45%, 30%)" },
  { bg: "hsl(270, 50%, 92%)", border: "hsl(270, 40%, 72%)", text: "hsl(270, 35%, 30%)" },
  { bg: "hsl(20, 65%, 91%)",  border: "hsl(20, 50%, 70%)",  text: "hsl(20, 40%, 30%)" },
  { bg: "hsl(190, 55%, 90%)", border: "hsl(190, 45%, 68%)", text: "hsl(190, 40%, 28%)" },
  { bg: "hsl(300, 40%, 92%)", border: "hsl(300, 35%, 72%)", text: "hsl(300, 30%, 30%)" },
];

const CodeMindMap = ({ keyword, thoughts }: CodeMindMapProps) => {
  const layout = useMemo(() => {
    const count = thoughts.length;
    if (count === 0) return { nodes: [], lines: [], width: 400, height: 200 };

    const rootX = 160;
    const rootY = count <= 4 ? 120 : (count * 52) / 2;
    const rootW = Math.min(keyword.length * 14 + 40, 200);
    const rootH = 44;

    const childX = 380;
    const spacing = 56;
    const totalH = (count - 1) * spacing;
    const startY = rootY - totalH / 2;

    const nodes = thoughts.map((t, i) => {
      const w = Math.min(t.length * 13 + 32, 220);
      const y = startY + i * spacing;
      return {
        label: t,
        x: childX,
        y,
        w,
        h: 38,
        color: NODE_COLORS[i % NODE_COLORS.length],
      };
    });

    const lines = nodes.map((n) => ({
      x1: rootX + rootW / 2,
      y1: rootY,
      x2: n.x - n.w / 2,
      y2: n.y,
    }));

    const maxRight = Math.max(...nodes.map((n) => n.x + n.w / 2)) + 40;
    const maxBottom = Math.max(...nodes.map((n) => n.y + n.h / 2), rootY + rootH / 2) + 40;
    const minTop = Math.min(...nodes.map((n) => n.y - n.h / 2), rootY - rootH / 2) - 40;

    return {
      rootX, rootY, rootW, rootH,
      nodes,
      lines,
      width: Math.max(maxRight, 560),
      height: maxBottom - minTop,
      offsetY: -minTop,
    };
  }, [keyword, thoughts]);

  if (thoughts.length === 0) return null;

  const { rootX, rootY, rootW, rootH, nodes, lines, width, height, offsetY = 0 } = layout as any;

  return (
    <div className="w-full overflow-auto flex justify-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full h-auto"
        style={{ minHeight: 200 }}
      >
        <defs>
          <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#00000015" />
          </filter>
          <marker id="dot" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4">
            <circle cx="3" cy="3" r="2.5" fill="hsl(220, 15%, 75%)" />
          </marker>
        </defs>

        <g transform={`translate(0, ${offsetY})`}>
          {/* Connection lines */}
          {lines.map((l: any, i: number) => {
            const midX = (l.x1 + l.x2) / 2;
            return (
              <path
                key={`line-${i}`}
                d={`M ${l.x1} ${l.y1} C ${midX} ${l.y1}, ${midX} ${l.y2}, ${l.x2} ${l.y2}`}
                fill="none"
                stroke="hsl(220, 15%, 78%)"
                strokeWidth="2"
                strokeDasharray="6 3"
                markerEnd="url(#dot)"
              />
            );
          })}

          {/* Root node */}
          <g filter="url(#node-shadow)">
            <rect
              x={rootX - rootW / 2}
              y={rootY - rootH / 2}
              width={rootW}
              height={rootH}
              rx={10}
              ry={10}
              fill="hsl(220, 55%, 50%)"
              stroke="hsl(220, 55%, 40%)"
              strokeWidth="2"
            />
            {/* Code bracket icon */}
            <text
              x={rootX - rootW / 2 + 16}
              y={rootY + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill="hsl(220, 80%, 90%)"
              fontSize="16"
              fontFamily="monospace"
              fontWeight="700"
            >
              {"{ }"}
            </text>
            <text
              x={rootX + 10}
              y={rootY + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="15"
              fontWeight="800"
              fontFamily="'Pretendard', system-ui, sans-serif"
            >
              {keyword}
            </text>
          </g>

          {/* Child nodes */}
          {nodes.map((n: any, i: number) => (
            <g key={`node-${i}`} filter="url(#node-shadow)">
              <rect
                x={n.x - n.w / 2}
                y={n.y - n.h / 2}
                width={n.w}
                height={n.h}
                rx={8}
                ry={8}
                fill={n.color.bg}
                stroke={n.color.border}
                strokeWidth="1.5"
              />
              {/* Line number style indicator */}
              <text
                x={n.x - n.w / 2 + 14}
                y={n.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={n.color.border}
                fontSize="11"
                fontFamily="monospace"
                fontWeight="600"
              >
                {String(i + 1).padStart(2, "0")}
              </text>
              <line
                x1={n.x - n.w / 2 + 26}
                y1={n.y - n.h / 2 + 6}
                x2={n.x - n.w / 2 + 26}
                y2={n.y + n.h / 2 - 6}
                stroke={n.color.border}
                strokeWidth="1"
                opacity="0.5"
              />
              <text
                x={n.x + 6}
                y={n.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill={n.color.text}
                fontSize="13"
                fontWeight="700"
                fontFamily="'Pretendard', system-ui, sans-serif"
              >
                {n.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CodeMindMap;
