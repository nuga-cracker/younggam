import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, Sparkles, Download, Shuffle, Pencil, Brain, MessageCircleQuestion, Menu, Copy, Users, X } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import CodeMindMap from "@/components/CodeMindMap";
import ChainQuestion from "@/components/ChainQuestion";
import ThemeToggle from "@/components/ThemeToggle";
import AppSidebar, { SavedSession, loadSessions, saveSessions } from "@/components/AppSidebar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

const MAX_LENGTH = 20;

const RANDOM_TOPICS: Record<string, string[]> = {
  "일상/감정": ["오늘의 기분", "감사한 것", "행복의 조건", "스트레스 해소", "좋아하는 계절", "아침 루틴", "저녁 습관", "주말 계획"],
  "창작/아이디어": ["미래 도시", "시간 여행", "꿈의 직업", "나만의 발명품", "이상적인 앱", "새로운 취미", "창업 아이템", "판타지 세계"],
  "자기 성장": ["올해 목표", "배우고 싶은 것", "극복한 어려움", "나의 강점", "5년 후 나", "인생 교훈", "존경하는 사람", "독서 목록"],
  "관계/소통": ["좋은 친구란", "가족의 의미", "소통 방법", "갈등 해결", "첫인상", "추억의 장소", "함께하고 싶은 활동", "감사 편지"],
  "여행/문화": ["가보고 싶은 나라", "좋아하는 음식", "문화 차이", "여행 필수템", "축제와 행사", "전통 놀이", "숨은 명소", "버킷리스트"],
  "철학코너": ["존재의 의미", "자유의지", "정의란 무엇인가", "행복의 본질", "시간이란", "죽음과 삶", "도덕의 기준", "나는 누구인가"],
  "과학코너": ["블랙홀", "양자역학", "유전자 편집", "인공지능", "기후변화", "우주 탐사", "뇌과학", "진화론"],
  "예술코너": ["색의 감정", "음악의 힘", "추상미술", "글쓰기 습관", "영화 속 메시지", "사진의 순간", "춤의 언어", "건축과 공간"],
  "사회/경제": ["빈부격차", "디지털 시대", "미래 직업", "환경과 경제", "공정한 사회", "세대 갈등", "미디어 리터러시", "글로벌 이슈"],
};

const ALL_TOPICS = Object.values(RANDOM_TOPICS).flat();

const findCategory = (kw: string): string => {
  for (const [cat, topics] of Object.entries(RANDOM_TOPICS)) {
    if (topics.includes(kw)) return cat;
  }
  return "미분류";
};

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
  "존재의 의미": ["목적", "가치", "의식", "관계", "성찰"],
  "자유의지": ["선택", "운명", "책임", "의지", "결정론"],
  "정의란 무엇인가": ["공정", "평등", "법", "권리", "의무"],
  "블랙홀": ["중력", "특이점", "사건의 지평선", "시공간", "호킹복사"],
  "양자역학": ["중첩", "관측", "확률", "파동", "입자"],
  "인공지능": ["딥러닝", "자율성", "윤리", "창의성", "특이점"],
  "색의 감정": ["빨강", "파랑", "따뜻함", "차가움", "조화"],
  "음악의 힘": ["리듬", "멜로디", "치유", "감동", "공감"],
  "빈부격차": ["기회", "교육", "복지", "구조", "연대"],
  "디지털 시대": ["연결", "개인정보", "속도", "고립", "혁신"],
};

const pickRandom = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const genId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;

const Index = () => {
  const [sessions, setSessions] = useState<SavedSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const [thoughts, setThoughts] = useState<{ text: string; member?: string }[]>([]);
  const [newThought, setNewThought] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [keywordLocked, setKeywordLocked] = useState(false);
  const [tab, setTab] = useState("manual");
  const [mode, setMode] = useState("mindmap");
  const [randomKeyword, setRandomKeyword] = useState("");
  const [randomThoughts, setRandomThoughts] = useState<string[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");

  const { toggleSidebar } = useSidebar();

  // Persist sessions
  useEffect(() => { saveSessions(sessions); }, [sessions]);

  // Auto-save current work as a session
  const saveCurrentSession = useCallback(() => {
    const activeKeyword = tab === "manual" ? keyword : randomKeyword;
    const activeThoughts = tab === "manual" ? thoughts : randomThoughts;
    if (!activeKeyword.trim()) return;

    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, keyword: activeKeyword, thoughts: activeThoughts, title: activeKeyword, category: findCategory(activeKeyword) }
            : s
        )
      );
    } else {
      const newSession: SavedSession = {
        id: genId(),
        title: activeKeyword,
        type: mode === "mindmap" ? "mindmap" : "chain",
        category: findCategory(activeKeyword),
        keyword: activeKeyword,
        thoughts: activeThoughts,
        createdAt: Date.now(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
    }
  }, [activeSessionId, keyword, thoughts, randomKeyword, randomThoughts, tab, mode]);

  // Auto-save on keyword/thoughts change (debounced via effect)
  useEffect(() => {
    const activeKeyword = tab === "manual" ? keyword : randomKeyword;
    if (!activeKeyword.trim()) return;
    const timer = setTimeout(saveCurrentSession, 800);
    return () => clearTimeout(timer);
  }, [keyword, thoughts, randomKeyword, randomThoughts, saveCurrentSession]);

  const loadSession = (session: SavedSession) => {
    setActiveSessionId(session.id);
    setMode(session.type === "chain" ? "chain" : "mindmap");
    setKeyword(session.keyword);
    setThoughts(session.thoughts);
    setKeywordLocked(!!session.keyword);
    setShowMap(false);
    if (session.type === "mindmap") {
      setTab("manual");
    }
  };

  const newSession = () => {
    setActiveSessionId(null);
    setKeyword("");
    setThoughts([]);
    setNewThought("");
    setShowMap(false);
    setKeywordLocked(false);
    setRandomKeyword("");
    setRandomThoughts([]);
    setShowMembers(false);
    setMembers([]);
    setNewMember("");
  };

  const addMember = () => {
    const trimmed = newMember.trim();
    if (!trimmed || members.includes(trimmed)) return;
    setMembers((prev) => [...prev, trimmed]);
    setNewMember("");
  };

  const removeMember = (name: string) => {
    setMembers((prev) => prev.filter((m) => m !== name));
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) newSession();
  };

  const addThought = () => {
    const trimmed = newThought.trim();
    if (!trimmed) return;
    setThoughts((prev) => [...prev, { text: trimmed }]);
    setNewThought("");
    setShowMap(false);
  };

  const removeThought = (index: number) => {
    setThoughts((prev) => prev.filter((_, i) => i !== index));
    setShowMap(false);
  };

  const assignMember = (index: number, member: string | undefined) => {
    setThoughts((prev) =>
      prev.map((t, i) => (i === index ? { ...t, member } : t))
    );
  };

  const rollRandomTopic = () => {
    const topic = pickRandom(ALL_TOPICS, 1)[0];
    setRandomKeyword(topic);
    const related = RELATED_WORDS[topic];
    if (related) {
      setRandomThoughts(pickRandom(related, Math.min(related.length, 4)));
    } else {
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

  const copyPng = async () => {
    if (!mapRef.current) return;
    try {
      const dataUrl = await toPng(mapRef.current, { backgroundColor: "#ffffff" });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    } catch {
      console.error("복사 실패");
    }
  };

  const activeKeyword = tab === "manual" ? keyword : randomKeyword;
  const activeThoughts = tab === "manual" ? thoughts.map((t) => t.text) : randomThoughts;
  const canGenerate = activeKeyword.trim() && activeThoughts.length > 0;
  const overLimit = newThought.length > MAX_LENGTH;

  const DOTS = ["#A7C7E7","#F4B6C2","#B5EAD7","#FFE0AC","#C3B1E1","#FFDAC1","#B5D8EB","#E2C2E9","#C7CEEA","#F5CAC3"];

  return (
    <>
      <AppSidebar
        activeSessionId={activeSessionId}
        onSelectSession={loadSession}
        onNewSession={newSession}
        sessions={sessions}
        onDeleteSession={deleteSession}
      />

      <div className="flex-1 min-h-screen bg-gradient-to-b from-background to-secondary/30 flex flex-col items-center px-4 py-10">
        {/* Top bar */}
        <div className="fixed top-4 left-4 z-50">
          <SidebarTrigger className="h-9 w-9 rounded-xl bg-card border border-border shadow-sm" />
        </div>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <header className="text-center mb-8 mt-6">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            영감을 시각화하세요
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Inspiration Lab
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            생각을 확장하고 깊이 탐구하세요
          </p>
        </header>

        <div className="w-full max-w-lg space-y-6">
          <Tabs value={mode} onValueChange={(v) => { setMode(v); setShowMap(false); }}>
            <TabsList className="w-full grid grid-cols-2 h-12 rounded-xl bg-muted/80 p-1">
              <TabsTrigger value="mindmap" className="rounded-lg text-sm font-bold gap-2 h-full data-[state=active]:shadow-md">
                <Brain className="h-4 w-4" />
                마인드맵
              </TabsTrigger>
              <TabsTrigger value="chain" className="rounded-lg text-sm font-bold gap-2 h-full data-[state=active]:shadow-md">
                <MessageCircleQuestion className="h-4 w-4" />
                꼬리질문
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mindmap" className="mt-6 space-y-6">
              <Tabs value={tab} onValueChange={(v) => { setTab(v); setShowMap(false); }}>
                <TabsList className="w-full grid grid-cols-2 h-10 rounded-xl">
                  <TabsTrigger value="manual" className="rounded-lg text-sm font-semibold">✏️ 수동 주제</TabsTrigger>
                  <TabsTrigger value="auto" className="rounded-lg text-sm font-semibold">🎲 자동 주제</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-6 mt-6">
                  {/* 멤버 추가 토글 */}
                  {!showMembers ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMembers(true)}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Users className="h-4 w-4" />
                      멤버 추가
                    </Button>
                  ) : (
                    <div className="space-y-3 bg-muted/40 border border-border/50 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          참여 멤버
                        </span>
                        <button onClick={() => setShowMembers(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="이름 입력"
                          value={newMember}
                          maxLength={10}
                          onChange={(e) => setNewMember(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addMember()}
                          className="flex-1 h-9 rounded-lg text-sm bg-card"
                        />
                        <Button onClick={addMember} size="sm" className="h-9 px-3 rounded-lg">
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      {members.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {members.map((m) => (
                            <span
                              key={m}
                              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full"
                            >
                              {m}
                              <button onClick={() => removeMember(m)} className="hover:text-destructive transition-colors">
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {keywordLocked ? (
                    <div className="flex items-center justify-between bg-card border-2 border-primary/20 rounded-xl px-5 h-14 shadow-sm">
                      <span className="text-lg font-bold text-foreground flex-1 text-center">{keyword}</span>
                      <button onClick={() => setKeywordLocked(false)} className="text-muted-foreground hover:text-primary transition-colors ml-2">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <Input
                      placeholder="오늘의 영감 키워드 (20자 이내)"
                      value={keyword}
                      maxLength={MAX_LENGTH}
                      autoFocus
                      onChange={(e) => { setKeyword(e.target.value); setShowMap(false); }}
                      onKeyDown={(e) => { if (e.key === "Enter" && keyword.trim()) setKeywordLocked(true); }}
                      className="text-center text-lg h-14 rounded-xl border-2 border-primary/20 focus-visible:ring-primary/30 focus-visible:border-primary/50 bg-card shadow-sm transition-all"
                    />
                  )}

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
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                onClick={() => setShowMap(true)}
                disabled={!canGenerate}
                variant="default"
                className="w-full gap-2 h-12 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
              >
                <Sparkles className="h-4 w-4" />
                마인드맵 생성
              </Button>

              {showMap && canGenerate && (
                <div className="space-y-3 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div ref={mapRef} className="border-2 border-border/40 rounded-2xl p-8 bg-card shadow-lg">
                    <CodeMindMap keyword={activeKeyword} thoughts={activeThoughts} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={savePng} variant="outline" className="flex-1 gap-2 h-11 rounded-xl">
                      <Download className="h-4 w-4" />
                      PNG로 저장
                    </Button>
                    <Button onClick={copyPng} variant="outline" className="flex-1 gap-2 h-11 rounded-xl">
                      <Copy className="h-4 w-4" />
                      복사
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chain" className="mt-6">
              <ChainQuestion />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Index;
