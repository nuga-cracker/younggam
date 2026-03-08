import { useMemo } from "react";

interface ThoughtItem {
  text: string;
  member?: string;
}

interface PriorityMatrixProps {
  keyword: string;
  thoughts: ThoughtItem[];
}

const QUADRANTS = [
  { label: "지금 바로!", sub: "높은 중요도 · 쉬운 실현", bg: "hsl(150, 50%, 92%)", border: "hsl(150, 45%, 60%)" },
  { label: "계획 수립", sub: "높은 중요도 · 어려운 실현", bg: "hsl(210, 55%, 94%)", border: "hsl(210, 50%, 65%)" },
  { label: "빠른 실행", sub: "낮은 중요도 · 쉬운 실현", bg: "hsl(35, 60%, 92%)", border: "hsl(35, 50%, 62%)" },
  { label: "보류/재검토", sub: "낮은 중요도 · 어려운 실현", bg: "hsl(0, 0%, 94%)", border: "hsl(0, 0%, 72%)" },
];

const PriorityMatrix = ({ keyword, thoughts }: PriorityMatrixProps) => {
  const distributed = useMemo(() => {
    const result: ThoughtItem[][] = [[], [], [], []];
    thoughts.forEach((t, i) => {
      result[i % 4].push(t);
    });
    return result;
  }, [thoughts]);

  if (thoughts.length === 0) return null;

  return (
    <div className="w-full">
      <h3
        className="text-center text-lg font-bold mb-2"
        style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
      >
        {keyword} — 우선순위 매트릭스
      </h3>

      {/* Axis labels */}
      <div className="relative">
        <div className="text-center text-xs font-semibold text-muted-foreground mb-2" style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}>
          ← 쉬운 실현 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 어려운 실현 →
        </div>

        <div className="flex">
          <div className="flex flex-col justify-around items-center pr-2 text-xs font-semibold text-muted-foreground" style={{ fontFamily: "'Pretendard', system-ui, sans-serif", writingMode: "vertical-rl" }}>
            <span>높은 중요도 ↑</span>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-3">
            {QUADRANTS.map((q, qi) => (
              <div
                key={qi}
                className="rounded-xl border-2 overflow-hidden min-h-[130px]"
                style={{ borderColor: q.border, backgroundColor: q.bg }}
              >
                <div
                  className="px-3 py-2 text-center"
                  style={{ backgroundColor: q.border, fontFamily: "'Pretendard', system-ui, sans-serif" }}
                >
                  <div className="font-bold text-sm text-white">{q.label}</div>
                  <div className="text-[10px] text-white/80">{q.sub}</div>
                </div>
                <div className="p-3 space-y-2">
                  {distributed[qi].map((item, ii) => (
                    <div
                      key={ii}
                      className="bg-white/80 dark:bg-white/10 rounded-lg px-3 py-2.5 text-sm shadow-sm border"
                      style={{
                        borderColor: q.border + "30",
                        fontFamily: "'Pretendard', system-ui, sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {item.member && (
                        <span className="text-xs font-bold opacity-60 mr-1.5">{item.member}</span>
                      )}
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriorityMatrix;
