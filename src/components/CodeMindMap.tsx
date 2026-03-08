import { useMemo } from "react";

interface ThoughtItem {
  text: string;
  member?: string;
}

interface CodeMindMapProps {
  keyword: string;
  thoughts: ThoughtItem[];
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

    const rootX = 180;
    const rootY = count <= 4 ? 150 : (count * 74) / 2;
    const rootW = Math.min(keyword.length * 18 + 56, 260);
    const rootH = 56;

    const childX = 450;
    const spacing = 78;
    const totalH = (count - 1) * spacing;
    const startY = rootY - totalH / 2;

    const nodes = thoughts.map((t, i) => {
      const displayText = t.member ? `${t.member}: ${t.text}` : t.text;
      const w = Math.min(displayText.length * 15 + 56, 320);
      const y = startY + i * spacing;
      return {
        label: t.text,
        member: t.member,
        displayText,
        x: childX,
        y,
        w,
        h: 50,
        color: NODE_COLORS[i % NODE_COLORS.length],
      };
    });

    const lines = nodes.map((n) => ({
      x1: rootX + rootW / 2,
      y1: rootY,
      x2: n.x - n.w / 2,
      y2: n.y,
    }));

    const maxRight = Math.max(...nodes.map((n) => n.x + n.w / 2)) + 50;
    const maxBottom = Math.max(...nodes.map((n) => n.y + n.h / 2), rootY + rootH / 2) + 50;
    const minTop = Math.min(...nodes.map((n) => n.y - n.h / 2), rootY - rootH / 2) - 50;

    return {
      rootX, rootY, rootW, rootH,
      nodes,
      lines,
      width: Math.max(maxRight, 640),
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
        style={{ minHeight: 220 }}
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
              rx={14}
              ry={14}
              fill="hsl(220, 55%, 50%)"
              stroke="hsl(220, 55%, 40%)"
              strokeWidth="2"
            />
            <text
              x={rootX}
              y={rootY + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="18"
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
                rx={12}
                ry={12}
                fill={n.color.bg}
                stroke={n.color.border}
                strokeWidth="1.5"
              />
              {n.member ? (
                <>
                  <text
                    x={n.x - n.w / 2 + 20}
                    y={n.y + 1}
                    textAnchor="start"
                    dominantBaseline="central"
                    fill={n.color.border}
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="'Pretendard', system-ui, sans-serif"
                  >
                    {n.member}
                  </text>
                  <text
                    x={n.x - n.w / 2 + 20 + n.member.length * 9 + 6}
                    y={n.y + 1}
                    textAnchor="start"
                    dominantBaseline="central"
                    fill={n.color.text}
                    fontSize="15"
                    fontWeight="700"
                    fontFamily="'Pretendard', system-ui, sans-serif"
                  >
                    {n.label}
                  </text>
                </>
              ) : (
                <text
                  x={n.x}
                  y={n.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={n.color.text}
                  fontSize="15"
                  fontWeight="700"
                  fontFamily="'Pretendard', system-ui, sans-serif"
                >
                  {n.label}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default CodeMindMap;
