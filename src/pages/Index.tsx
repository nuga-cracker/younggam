import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Sparkles, Download, Shuffle } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MermaidChart from "@/components/MermaidChart";

const STORAGE_KEY = "inspiration-mindmap";
const MAX_LENGTH = 20;

const RANDOM_TOPICS: Record<string, string[]> = {
  "일상/감정": [
    "오늘의 기분", "감사한 것", "행복의 조건", "스트레스 해소",
    "좋아하는 계절", "아침 루틴", "저녁 습관", "주말 계획",
  ],
  "창작/아이디어": [
    "미래 도시", "시간 여행", "꿈의 직업", "나만의 발명품",
    "이상적인 앱", "새로운 취미", "창업 아이템", "판타지 세계",
  ],
  "자기 성장": [
    "올해 목표", "배우고 싶은 것", "극복한 어려움", "나의 강점",
    "5년 후 나", "인생 교훈", "존경하는 사람", "독서 목록",
  ],
  "관계/소통": [
    "좋은 친구란", "가족의 의미", "소통 방법", "갈등 해결",
    "첫인상", "추억의 장소", "함께하고 싶은 활동", "감사 편지",
  ],
  "여행/문화": [
    "가보고 싶은 나라", "좋아하는 음식", "문화 차이", "여행 필수템",
    "축제와 행사", "전통 놀이", "숨은 명소", "버킷리스트",
  ],
};

const ALL_TOPICS = Object.values(RANDOM_TOPICS).flat();

const RELATED_WORDS: Record<string, string[]> = {
  "오늘의 기분": ["설렘", "평온", "기대감", "피곤함", "활력"],
  "감사한 것": ["가족", "건강", "친구", "자연", "음식"],
  "행복의 조건": ["자유", "사랑", "성취", "여유", "건강"],
  "스트레스 해소": ["운동", "음악", "산책", "명상", "수면"],
  "미래 도시": ["자율주행", "하늘길", "녹지공원", "로봇", "에너지"],
  "시간 여행": ["과거", "미래", "역사", "만남", "모험"],
  "꿈의 직업": ["자유로운", "창의적", "보람", "성장", "팀워크"],
  "올해 목표": ["건강", "공부", "저축", "여행", "독서"],
  "가보고 싶은 나라": ["일본", "스위스", "아이슬란드", "이탈리아", "뉴질랜드"],
  "좋아하는 음식": ["한식", "디저트", "면요리", "구이", "과일"],
};

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

const pickRandom = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const Index = () => {
  const [keyword, setKeyword] = useState(load().keyword);
  const [thoughts, setThoughts] = useState<string[]>(load().thoughts);
  const [newThought, setNewThought] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [tab, setTab] = useState("manual");
  const [randomKeyword, setRandomKeyword] = useState("");
  const [randomThoughts, setRandomThoughts] = useState<string[]>([]);
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

  const rollRandomTopic = () => {
    const topic = pickRandom(ALL_TOPICS, 1)[0];
    setRandomKeyword(topic);
    const related = RELATED_WORDS[topic];
    if (related) {
      setRandomThoughts(pickRandom(related, Math.min(related.length, 4)));
    } else {
      // Generate generic sub-ideas
      const otherTopics = ALL_TOPICS.filter((t) => t !== topic);
      setRandomThoughts(pickRandom(otherTopics, 3));
    }
    setShowMap(false);
  };

  const savePng = async () => {
    if (!mapRef.current) return;
    try {
      const activeKeyword = tab === "manual" ? keyword : randomKeyword;
      const dataUrl = await toPng(mapRef.current, { backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `mindmap-${activeKeyword || "영감"}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      console.error("PNG 저장 실패");
    }
  };

  const activeKeyword = tab === "manual" ? keyword : randomKeyword;
  const activeThoughts = tab === "manual" ? thoughts : randomThoughts;
  const canGenerate = activeKeyword.trim() && activeThoughts.length > 0;
  const overLimit = newThought.length > MAX_LENGTH;

  const DOTS = ["#A7C7E7","#F4B6C2","#B5EAD7","#FFE0AC","#C3B1E1","#FFDAC1","#B5D8EB","#E2C2E9","#C7CEEA","#F5CAC3"];

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
        <Tabs value={tab} onValueChange={(v) => { setTab(v); setShowMap(false); }}>
          <TabsList className="w-full grid grid-cols-2 h-11 rounded-xl">
            <TabsTrigger value="manual" className="rounded-lg text-sm font-semibold">
              ✏️ 수동 주제
            </TabsTrigger>
            <TabsTrigger value="auto" className="rounded-lg text-sm font-semibold">
              🎲 자동 주제
            </TabsTrigger>
          </TabsList>

          {/* 수동 주제 탭 */}
          <TabsContent value="manual" className="space-y-6 mt-6">
            <Input
              placeholder="오늘의 영감 키워드 (20자 이내)"
              value={keyword}
              maxLength={MAX_LENGTH}
              onChange={(e) => { setKeyword(e.target.value); setShowMap(false); }}
              className="text-center text-lg h-14 rounded-xl border-2 border-primary/20 focus-visible:ring-primary/30 focus-visible:border-primary/50 bg-card shadow-sm transition-all"
            />

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
                <Button onClick={addThought} size="icon" disabled={overLimit} className="shrink-0 h-11 w-11 rounded-xl shadow-sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className={`text-xs text-right pr-1 ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
                {newThought.length}/{MAX_LENGTH}
              </p>
            </div>

            {thoughts.length > 0 && (
              <ul className="space-y-2">
                {thoughts.map((t, i) => (
                  <li key={i} className="group flex items-center justify-between bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DOTS[i % 10] }} />
                      <span>{t}</span>
                    </div>
                    <button onClick={() => removeThought(i)} className="text-muted-foreground/40 group-hover:text-destructive transition-colors ml-3">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          {/* 자동 주제 탭 */}
          <TabsContent value="auto" className="space-y-6 mt-6">
            <div className="text-center space-y-4">
              <Button onClick={rollRandomTopic} variant="outline" className="gap-2 h-14 w-full rounded-xl border-2 border-primary/20 text-lg font-semibold shadow-sm hover:shadow-md transition-all">
                <Shuffle className="h-5 w-5" />
                {randomKeyword ? "다시 뽑기" : "랜덤 주제 뽑기"}
              </Button>

              {randomKeyword && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                  <div className="bg-card border-2 border-primary/20 rounded-xl p-6 shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">오늘의 주제</p>
                    <p className="text-2xl font-bold text-foreground">{randomKeyword}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide">연관 키워드</p>
                    <ul className="space-y-2">
                    {randomThoughts.map((t, i) => (
                      <li key={i} className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DOTS[i % 10] }} />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
              <MermaidChart keyword={activeKeyword} thoughts={activeThoughts} />
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
