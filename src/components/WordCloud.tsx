import { useMemo } from "react";

interface ThoughtItem {
  text: string;
  member?: string;
}

interface WordCloudProps {
  keyword: string;
  thoughts: ThoughtItem[];
}

const COLORS = [
  "hsl(210, 55%, 50%)",
  "hsl(340, 50%, 50%)",
  "hsl(150, 45%, 40%)",
  "hsl(35, 55%, 45%)",
  "hsl(270, 45%, 50%)",
  "hsl(20, 55%, 48%)",
  "hsl(190, 50%, 42%)",
  "hsl(300, 40%, 48%)",
];

const WordCloud = ({ keyword, thoughts }: WordCloudProps) => {
  const words = useMemo(() => {
    if (thoughts.length === 0) return [];

    // Split thoughts into individual words and count frequency
    const freq = new Map<string, number>();
    thoughts.forEach((t) => {
      // Use whole thought text as a "word" for simplicity
      const text = t.text.trim();
      if (text) {
        freq.set(text, (freq.get(text) || 0) + 1);
      }
    });

    // Also add the keyword with high weight
    const maxFreq = Math.max(...freq.values(), 1);

    const items = Array.from(freq.entries()).map(([text, count]) => ({
      text,
      weight: count,
      normalizedSize: 16 + (count / maxFreq) * 20,
    }));

    // Shuffle for organic look
    return items.sort(() => Math.random() - 0.5);
  }, [thoughts]);

  if (thoughts.length === 0) return null;

  return (
    <div className="w-full">
      <h3
        className="text-center text-lg font-bold mb-6"
        style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}
      >
        {keyword} — 워드클라우드
      </h3>
      <div className="flex flex-wrap justify-center items-center gap-3 p-6 min-h-[200px]">
        {/* Central keyword */}
        <span
          className="font-extrabold px-5 py-3 rounded-2xl shadow-md"
          style={{
            fontSize: "28px",
            color: "white",
            backgroundColor: "hsl(220, 55%, 50%)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
          }}
        >
          {keyword}
        </span>

        {words.map((w, i) => {
          const color = COLORS[i % COLORS.length];
          const rotation = [-6, 0, 3, -3, 6, 0][i % 6];
          return (
            <span
              key={i}
              className="inline-block font-bold px-3 py-1.5 rounded-xl transition-transform hover:scale-110 cursor-default"
              style={{
                fontSize: `${w.normalizedSize}px`,
                color,
                opacity: 0.7 + w.weight * 0.1,
                transform: `rotate(${rotation}deg)`,
                fontFamily: "'Pretendard', system-ui, sans-serif",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default WordCloud;
