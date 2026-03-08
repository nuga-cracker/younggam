import { useMemo } from "react";

interface ThoughtItem {
  text: string;
  member?: string;
}

interface SwotAnalysisProps {
  keyword: string;
  thoughts: ThoughtItem[];
}

const QUADRANTS = [
  { key: "S", label: "강점 (Strengths)", bg: "hsl(150, 45%, 92%)", border: "hsl(150, 45%, 60%)", header: "hsl(150, 50%, 35%)" },
  { key: "W", label: "약점 (Weaknesses)", bg: "hsl(340, 50%, 94%)", border: "hsl(340, 45%, 65%)", header: "hsl(340, 45%, 38%)" },
  { key: "O", label: "기회 (Opportunities)", bg: "hsl(210, 55%, 94%)", border: "hsl(210, 50%, 65%)", header: "hsl(210, 55%, 38%)" },
  { key: "T", label: "위협 (Threats)", bg: "hsl(35, 60%, 92%)", border: "hsl(35, 50%, 60%)", header: "hsl(35, 50%, 35%)" },
];

const SwotAnalysis = ({ keyword, thoughts }: SwotAnalysisProps) => {
  const distributed = useMemo(() => {
    // Distribute thoughts evenly across 4 quadrants
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
        className="text-center text-lg font-bold mb-6"
        style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
      >
        {keyword} — SWOT 분석
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {QUADRANTS.map((q, qi) => (
          <div
            key={q.key}
            className="rounded-xl border-2 overflow-hidden min-h-[140px]"
            style={{ borderColor: q.border, backgroundColor: q.bg }}
          >
            <div
              className="px-4 py-2.5 font-bold text-sm text-center"
              style={{
                backgroundColor: q.border,
                color: "white",
                fontFamily: "'Pretendard', system-ui, sans-serif",
              }}
            >
              {q.label}
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
              {distributed[qi].length === 0 && (
                <p className="text-xs text-center py-4 opacity-40" style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}>
                  항목을 드래그하여 배치하세요
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwotAnalysis;
