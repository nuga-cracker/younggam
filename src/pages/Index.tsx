import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MermaidChart from "@/components/MermaidChart";

const STORAGE_KEY = "inspiration-mindmap";

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

  const canGenerate = keyword.trim() && thoughts.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-16">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          영감 마인드맵
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          키워드를 중심으로 생각을 확장하세요
        </p>
      </header>

      <div className="w-full max-w-lg space-y-6">
        {/* Keyword */}
        <Input
          placeholder="오늘의 영감 키워드"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setShowMap(false);
          }}
          className="text-center text-lg h-12 border-primary/30 focus-visible:ring-primary"
        />

        {/* Add thought */}
        <div className="flex gap-2">
          <Input
            placeholder="생각을 입력하세요"
            value={newThought}
            onChange={(e) => setNewThought(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addThought()}
            className="flex-1"
          />
          <Button onClick={addThought} size="icon" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* List */}
        {thoughts.length > 0 && (
          <ul className="space-y-2">
            {thoughts.map((t, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-muted rounded-lg px-4 py-2.5 text-sm text-foreground"
              >
                <span>{t}</span>
                <button
                  onClick={() => removeThought(i)}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-3"
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
          className="w-full gap-2"
        >
          <Sparkles className="h-4 w-4" />
          마인드맵 생성
        </Button>

        {/* Mind map */}
        {showMap && canGenerate && (
          <div className="border rounded-xl p-6 bg-card mt-4">
            <MermaidChart keyword={keyword} thoughts={thoughts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
