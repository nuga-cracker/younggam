import { useMemo, useState, useRef, useCallback, useEffect } from "react";

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

interface NodeData {
  label: string;
  member?: string;
  displayText: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: typeof NODE_COLORS[0];
}

const CodeMindMap = ({ keyword, thoughts }: CodeMindMapProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & zoom state
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  // Node drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragStart = useRef({ x: 0, y: 0, nx: 0, ny: 0 });

  // Node positions (mutable after drag)
  const initialLayout = useMemo(() => {
    const count = thoughts.length;
    if (count === 0) return null;

    const rootX = 200;
    const rootY = Math.max(150, (count * 78) / 2);
    const rootW = Math.min(keyword.length * 18 + 56, 260);
    const rootH = 56;

    const childX = 500;
    const spacing = 78;
    const totalH = (count - 1) * spacing;
    const startY = rootY - totalH / 2;

    const nodes: NodeData[] = thoughts.map((t, i) => {
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

    const maxRight = Math.max(...nodes.map((n) => n.x + n.w / 2)) + 60;
    const maxBottom = Math.max(...nodes.map((n) => n.y + n.h / 2), rootY + rootH / 2) + 60;
    const minTop = Math.min(...nodes.map((n) => n.y - n.h / 2), rootY - rootH / 2) - 60;

    return { rootX, rootY, rootW, rootH, nodes, width: Math.max(maxRight, 700), height: maxBottom - minTop, offsetY: -minTop };
  }, [keyword, thoughts]);

  const [nodePositions, setNodePositions] = useState<{ x: number; y: number }[]>([]);
  const [rootPos, setRootPos] = useState({ x: 200, y: 150 });

  // Reset positions when layout changes
  useEffect(() => {
    if (!initialLayout) return;
    setNodePositions(initialLayout.nodes.map((n) => ({ x: n.x, y: n.y })));
    setRootPos({ x: initialLayout.rootX, y: initialLayout.rootY });
    setViewBox({ x: 0, y: 0, w: initialLayout.width, h: initialLayout.height });
  }, [initialLayout]);

  const getSvgPoint = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: viewBox.x + (clientX - rect.left) / rect.width * viewBox.w,
      y: viewBox.y + (clientY - rect.top) / rect.height * viewBox.h,
    };
  }, [viewBox]);

  // Zoom with wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const pt = getSvgPoint(e.clientX, e.clientY);

    setViewBox((prev) => {
      const newW = Math.max(200, Math.min(prev.w * scaleFactor, 3000));
      const newH = Math.max(150, Math.min(prev.h * scaleFactor, 2500));
      const ratio = newW / prev.w;
      return {
        x: pt.x - (pt.x - prev.x) * ratio,
        y: pt.y - (pt.y - prev.y) * ratio,
        w: newW,
        h: newH,
      };
    });
  }, [getSvgPoint]);

  // Pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (dragIndex !== null) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
  }, [dragIndex, viewBox]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragIndex !== null) {
      // Dragging a node
      const pt = getSvgPoint(e.clientX, e.clientY);
      const dx = pt.x - dragStart.current.x;
      const dy = pt.y - dragStart.current.y;

      if (dragIndex === -1) {
        // Root node
        setRootPos({ x: dragStart.current.nx + dx, y: dragStart.current.ny + dy });
      } else {
        setNodePositions((prev) =>
          prev.map((p, i) =>
            i === dragIndex ? { x: dragStart.current.nx + dx, y: dragStart.current.ny + dy } : p
          )
        );
      }
      return;
    }

    if (!isPanning) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (e.clientX - panStart.current.x) / rect.width * viewBox.w;
    const dy = (e.clientY - panStart.current.y) / rect.height * viewBox.h;
    setViewBox((prev) => ({ ...prev, x: panStart.current.vx - dx, y: panStart.current.vy - dy }));
  }, [dragIndex, isPanning, getSvgPoint, viewBox]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragIndex(null);
  }, []);

  const startNodeDrag = useCallback((e: React.MouseEvent, index: number, nx: number, ny: number) => {
    e.stopPropagation();
    const pt = getSvgPoint(e.clientX, e.clientY);
    setDragIndex(index);
    dragStart.current = { x: pt.x, y: pt.y, nx, ny };
  }, [getSvgPoint]);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      setIsPanning(true);
      panStart.current = { x: t.clientX, y: t.clientY, vx: viewBox.x, vy: viewBox.y };
    }
  }, [viewBox]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    const t = e.touches[0];
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (t.clientX - panStart.current.x) / rect.width * viewBox.w;
    const dy = (t.clientY - panStart.current.y) / rect.height * viewBox.h;
    setViewBox((prev) => ({ ...prev, x: panStart.current.vx - dx, y: panStart.current.vy - dy }));
  }, [isPanning, viewBox]);

  if (!initialLayout || thoughts.length === 0 || nodePositions.length === 0) return null;

  const { rootW, rootH, nodes, width, height, offsetY } = initialLayout;

  const lines = nodePositions.map((n) => ({
    x1: rootPos.x,
    y1: rootPos.y + offsetY,
    x2: n.x - (nodes[0]?.w || 100) / 2,
    y2: n.y + offsetY,
  }));

  return (
    <div ref={containerRef} className="w-full overflow-hidden flex justify-center relative" style={{ minHeight: 300 }}>
      {/* Zoom controls */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        <button
          onClick={() => setViewBox((v) => ({ ...v, w: v.w * 0.85, h: v.h * 0.85 }))}
          className="w-7 h-7 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center text-foreground hover:bg-muted transition-colors text-sm font-bold"
        >+</button>
        <button
          onClick={() => setViewBox((v) => ({ ...v, w: v.w * 1.15, h: v.h * 1.15 }))}
          className="w-7 h-7 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center text-foreground hover:bg-muted transition-colors text-sm font-bold"
        >−</button>
        <button
          onClick={() => setViewBox({ x: 0, y: 0, w: width, h: height })}
          className="w-7 h-7 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center text-foreground hover:bg-muted transition-colors text-[10px] font-bold"
          title="리셋"
        >⟲</button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height={Math.max(height, 300)}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="max-w-full h-auto select-none"
        style={{ cursor: isPanning ? "grabbing" : dragIndex !== null ? "grabbing" : "grab", minHeight: 300 }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { setIsPanning(false); setDragIndex(null); }}
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
          {nodePositions.map((n, i) => {
            const x1 = rootPos.x;
            const y1 = rootPos.y;
            const nodeW = nodes[i]?.w || 100;
            const x2 = n.x - nodeW / 2;
            const y2 = n.y;
            const midX = (x1 + x2) / 2;
            return (
              <path
                key={`line-${i}`}
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke="hsl(220, 15%, 78%)"
                strokeWidth="2"
                strokeDasharray="6 3"
                markerEnd="url(#dot)"
                style={{ pointerEvents: "none" }}
              />
            );
          })}

          {/* Root node (draggable) */}
          <g
            filter="url(#node-shadow)"
            style={{ cursor: "grab" }}
            onMouseDown={(e) => startNodeDrag(e, -1, rootPos.x, rootPos.y)}
          >
            <rect
              x={rootPos.x - rootW / 2}
              y={rootPos.y - rootH / 2}
              width={rootW}
              height={rootH}
              rx={14}
              ry={14}
              fill="hsl(220, 55%, 50%)"
              stroke="hsl(220, 55%, 40%)"
              strokeWidth="2"
            />
            <text
              x={rootPos.x}
              y={rootPos.y + 1}
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

          {/* Child nodes (draggable) */}
          {nodePositions.map((pos, i) => {
            const n = nodes[i];
            if (!n) return null;
            return (
              <g
                key={`node-${i}`}
                filter="url(#node-shadow)"
                style={{ cursor: "grab" }}
                onMouseDown={(e) => startNodeDrag(e, i, pos.x, pos.y)}
              >
                <rect
                  x={pos.x - n.w / 2}
                  y={pos.y - n.h / 2}
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
                      x={pos.x - n.w / 2 + 20}
                      y={pos.y + 1}
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
                      x={pos.x - n.w / 2 + 20 + n.member.length * 9 + 6}
                      y={pos.y + 1}
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
                    x={pos.x}
                    y={pos.y + 1}
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
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default CodeMindMap;
