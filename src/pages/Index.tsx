import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Sparkles, Download } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MermaidChart from "@/components/MermaidChart";

const STORAGE_KEY = "inspiration-mindmap";
const MAX_LENGTH = 20;

interface AppData {
  keyword: string;
  thoughts: string[];
}

const load = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { keyword: "", thoughts: [] };
};

const Index = () => {
  const [keyword, setKeyword] = useState(load().keyword);
  const [thoughts, setThoughts] = useState<string[]>(load().thoughts);
  const [newThought, setNewThought] = useState("");
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const save = useCallback((k: string, t: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ keyword: k, thoughts: t }));
  }, []);

  useEffect(() => save(keyword, thoughts), [keyword, thoughts, save]);

  const addThought = () => {
    const trimmed = newThought.trim();
    if (!trimmed) return;
    setThoughts((prev) => [...prev, trimmed]);
    setNewThought("");
    setShowMap(false);
  };

  const removeThought = (index: number) => {
    setThoughts((prev) => prev.filter((_, i) => i !== index));
    setShowMap(false);
  };

  const savePng = async () => {
    if (!mapRef.current) return;
    try {
      const dataUrl = await toPng(mapRef.current, { backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `mindmap-${keyword || "영감"}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      console.error("PNG 저장 실패");
    }
  };

  const canGenerate = keyword.trim() && thoughts.length > 0;
  const overLimit = newThought.length > MAX_LENGTH;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex flex-col items-center px-4 py-16">
      <header className="text-center mb-14">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
          <Sparkles className="h-3 w-3" />
          영감을 시각화하세요
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          마인드맵
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          키워드를 중심으로 생각을 확장하세요
        </p>
      </header>

      <div className="w-full max-w-lg space-y-6">
        {/* Keyword */}
        <div className="relative">
          <Input
            placeholder="오늘의 영감 키워드 (20자 이내)"
            value={keyword}
            maxLength={MAX_LENGTH}
            onChange={(e) => {
              setKeyword(e.target.value);
              setShowMap(false);
            }}
            className="text-center text-lg h-14 rounded-xl border-2 border-primary/20 focus-visible:ring-primary/30 focus-visible:border-primary/50 bg-card shadow-sm transition-all"
          />
        </div>

        {/* Add thought */}
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <Input
              placeholder="짧은 생각을 입력하세요 (20자 이내)"
              value={newThought}
              maxLength={MAX_LENGTH}
              onChange={(e) => setNewThought(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !overLimit && addThought()}
              className="flex-1 h-11 rounded-xl border-2 border-border/60 focus-visible:ring-primary/30 bg-card shadow-sm"
            />
            <Button
              onClick={addThought}
              size="icon"
              disabled={overLimit}
              className="shrink-0 h-11 w-11 rounded-xl shadow-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className={`text-xs text-right pr-1 ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
            {newThought.length}/{MAX_LENGTH}
          </p>
        </div>

        {/* List */}
        {thoughts.length > 0 && (
          <ul className="space-y-2">
            {thoughts.map((t, i) => (
              <li
                key={i}
                className="group flex items-center justify-between bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: ["#A7C7E7","#F4B6C2","#B5EAD7","#FFE0AC","#C3B1E1","#FFDAC1","#B5D8EB","#E2C2E9","#C7CEEA","#F5CAC3"][i % 10] }}
                  />
                  <span>{t}</span>
                </div>
                <button
                  onClick={() => removeThought(i)}
                  className="text-muted-foreground/40 group-hover:text-destructive transition-colors ml-3"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Generate */}
        <Button
          onClick={() => setShowMap(true)}
          disabled={!canGenerate}
          variant="default"
          className="w-full gap-2 h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <Sparkles className="h-4 w-4" />
          마인드맵 생성
        </Button>

        {/* Mind map */}
        {showMap && canGenerate && (
          <div className="space-y-3 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div ref={mapRef} className="border-2 border-border/40 rounded-2xl p-8 bg-card shadow-lg">
              <MermaidChart keyword={keyword} thoughts={thoughts} />
            </div>
            <Button onClick={savePng} variant="outline" className="w-full gap-2 h-11 rounded-xl">
              <Download className="h-4 w-4" />
              PNG로 저장
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
