import { useMemo } from "react";

interface ThoughtItem {
  text: string;
  member?: string;
}

interface AffinityDiagramProps {
  keyword: string;
  thoughts: ThoughtItem[];
}

const GROUP_COLORS = [
  { bg: "hsl(210, 60%, 94%)", border: "hsl(210, 50%, 75%)", header: "hsl(210, 55%, 45%)" },
  { bg: "hsl(340, 55%, 94%)", border: "hsl(340, 45%, 75%)", header: "hsl(340, 50%, 45%)" },
  { bg: "hsl(150, 45%, 92%)", border: "hsl(150, 40%, 68%)", header: "hsl(150, 45%, 38%)" },
  { bg: "hsl(35, 65%, 92%)", border: "hsl(35, 50%, 68%)", header: "hsl(35, 50%, 40%)" },
  { bg: "hsl(270, 45%, 94%)", border: "hsl(270, 38%, 75%)", header: "hsl(270, 45%, 42%)" },
];

const AffinityDiagram = ({ keyword, thoughts }: AffinityDiagramProps) => {
  const groups = useMemo(() => {
    if (thoughts.length === 0) return [];

    // Group by member if available, otherwise create auto groups
    const memberMap = new Map<string, ThoughtItem[]>();
    const noMember: ThoughtItem[] = [];

    thoughts.forEach((t) => {
      if (t.member) {
        const arr = memberMap.get(t.member) || [];
        arr.push(t);
        memberMap.set(t.member, arr);
      } else {
        noMember.push(t);
      }
    });

    const result: { label: string; items: ThoughtItem[] }[] = [];
    memberMap.forEach((items, member) => {
      result.push({ label: member, items });
    });
    if (noMember.length > 0) {
      result.push({ label: "미분류", items: noMember });
    }

    // If only one group (no members), split into chunks
    if (result.length === 1 && result[0].label === "미분류") {
      const items = result[0].items;
      const chunkSize = Math.ceil(items.length / Math.min(3, items.length));
      const chunks: { label: string; items: ThoughtItem[] }[] = [];
      for (let i = 0; i < items.length; i += chunkSize) {
        chunks.push({
          label: `그룹 ${chunks.length + 1}`,
          items: items.slice(i, i + chunkSize),
        });
      }
      return chunks;
    }

    return result;
  }, [thoughts]);

  if (thoughts.length === 0) return null;

  return (
    <div className="w-full">
      <h3
        className="text-center text-lg font-bold mb-6"
        style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
      >
        {keyword} — 어피니티 다이어그램
      </h3>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(groups.length, 3)}, 1fr)` }}>
        {groups.map((group, gi) => {
          const color = GROUP_COLORS[gi % GROUP_COLORS.length];
          return (
            <div
              key={gi}
              className="rounded-xl border-2 overflow-hidden"
              style={{ borderColor: color.border, backgroundColor: color.bg }}
            >
              <div
                className="px-4 py-3 text-center font-bold text-sm"
                style={{
                  backgroundColor: color.border,
                  color: "white",
                  fontFamily: "'Pretendard', system-ui, sans-serif",
                }}
              >
                {group.label}
              </div>
              <div className="p-3 space-y-2">
                {group.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="bg-white/80 dark:bg-white/10 rounded-lg px-4 py-3 text-sm font-semibold shadow-sm border"
                    style={{
                      borderColor: color.border + "40",
                      fontFamily: "'Pretendard', system-ui, sans-serif",
                    }}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AffinityDiagram;
