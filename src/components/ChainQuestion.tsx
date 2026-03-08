import { useState, useRef, useEffect } from "react";
import { Plus, CornerDownRight, RotateCcw, RefreshCw, Eye, List, Download, Copy, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toPng } from "html-to-image";

const MAX_LENGTH = 40;

const STARTER_QUESTIONS = [
  "나는 왜 이 일을 하고 있을까?",
  "진짜 원하는 건 뭘까?",
  "지금 가장 두려운 건?",
  "10년 후 나는 어떤 모습일까?",
  "오늘 가장 감사한 건?",
  "내가 피하고 있는 건 뭘까?",
  "만약 실패가 없다면 뭘 할까?",
  "나를 행복하게 하는 건?",
];

interface QAPair {
  question: string;
  answer: string;
}

const DOTS = ["#A7C7E7","#F4B6C2","#B5EAD7","#FFE0AC","#C3B1E1","#FFDAC1","#B5D8EB","#E2C2E9","#C7CEEA","#F5CAC3"];

const ChainTimeline = ({ chain }: { chain: QAPair[] }) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const savePng = async () => {
    if (!timelineRef.current) return;
    try {
      const dataUrl = await toPng(timelineRef.current, { backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `chain-timeline.png`;
      link.href = dataUrl;
      link.click();
    } catch { /* ignore */ }
  };

  const copyPng = async () => {
    if (!timelineRef.current) return;
    try {
      const dataUrl = await toPng(timelineRef.current, { backgroundColor: "#ffffff" });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    } catch { /* ignore */ }
  };

  if (chain.length === 0) return null;

  return (
    <div className="space-y-3">
      <div ref={timelineRef} className="bg-card border-2 border-border/40 rounded-2xl p-6 shadow-lg">
        <p className="text-xs font-bold text-muted-foreground mb-5 tracking-wide">사고의 흐름 타임라인</p>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/60 via-primary/30 to-primary/10 rounded-full" />

          {chain.map((pair, i) => (
            <div key={i} className="relative pl-10 pb-6 last:pb-0">
              {/* Dot */}
              <div
                className="absolute left-[9px] top-1.5 w-[14px] h-[14px] rounded-full border-2 border-card shadow-sm"
                style={{ backgroundColor: DOTS[i % 10] }}
              />

              {/* Arrow connector */}
              {i < chain.length - 1 && (
                <div className="absolute left-[13px] top-[22px] w-0.5 h-[calc(100%-18px)]" />
              )}

              {/* Q&A card */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                    Q{i + 1}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {i === 0 ? "시작 질문" : `${i}단계 깊이`}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug" style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}>
                  {pair.question}
                </p>
                <div className="bg-muted/50 border border-border/30 rounded-lg px-3 py-2">
                  <p className="text-sm text-foreground/80" style={{ fontFamily: "'Pretendard', system-ui, sans-serif" }}>
                    {pair.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Final depth marker */}
          <div className="relative pl-10 pt-2">
            <div
              className="absolute left-[7px] top-3 w-[18px] h-[18px] rounded-full border-2 border-primary/40 bg-primary/20 flex items-center justify-center"
            >
              <span className="text-[8px] font-bold text-primary">{chain.length}</span>
            </div>
            <p className="text-xs font-semibold text-primary/60 pt-0.5">
              사고의 깊이: {chain.length}단계 도달
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={savePng} variant="outline" className="flex-1 gap-2 h-10 rounded-xl text-xs">
          <Download className="h-3.5 w-3.5" />
          PNG 저장
        </Button>
        <Button onClick={copyPng} variant="outline" className="flex-1 gap-2 h-10 rounded-xl text-xs">
          <Copy className="h-3.5 w-3.5" />
          복사
        </Button>
      </div>
    </div>
  );
};

interface ChainQuestionProps {
  initialChain?: QAPair[];
  initialQuestion?: string;
  onChainChange?: (chain: QAPair[], currentQ: string) => void;
}

const ChainQuestion = ({ initialChain, initialQuestion, onChainChange }: ChainQuestionProps) => {
  const [chain, setChain] = useState<QAPair[]>(initialChain || []);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [nextQuestion, setNextQuestion] = useState("");
  const [started, setStarted] = useState(!!(initialChain?.length || initialQuestion));
  const [currentQ, setCurrentQ] = useState(initialQuestion || "");
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  // Notify parent on chain changes
  useEffect(() => {
    if (started) onChainChange?.(chain, currentQ);
  }, [chain, currentQ, started]);

  const startWithRandom = () => {
    const q = STARTER_QUESTIONS[Math.floor(Math.random() * STARTER_QUESTIONS.length)];
    setCurrentQ(q);
    setChain([]);
    setCurrentAnswer("");
    setNextQuestion("");
    setStarted(true);
  };

  const skipToNewQuestion = () => {
    const q = STARTER_QUESTIONS[Math.floor(Math.random() * STARTER_QUESTIONS.length)];
    setCurrentQ(q);
    setCurrentAnswer("");
    setNextQuestion("");
  };

  const rerollQuestion = () => {
    let q = currentQ;
    while (q === currentQ) {
      q = STARTER_QUESTIONS[Math.floor(Math.random() * STARTER_QUESTIONS.length)];
    }
    setCurrentQ(q);
    setCurrentAnswer("");
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim()) return;
    const newPair: QAPair = { question: currentQ, answer: currentAnswer.trim() };
    setChain((prev) => [...prev, newPair]);

    if (nextQuestion.trim()) {
      setCurrentQ(nextQuestion.trim());
      setNextQuestion("");
    } else {
      const patterns = [
        (a: string) => `"${a}" — 왜 그렇게 생각해?`,
        (a: string) => `"${a}" — 그 생각의 근거는 뭘까?`,
        (a: string) => `"${a}" — 반대로 생각하면 어떨까?`,
        (a: string) => `"${a}" — 그게 정말 중요한 이유는?`,
        (a: string) => `"${a}" — 다른 사람이라면 어떻게 답할까?`,
        (a: string) => `"${a}" — 그래서 다음엔 뭘 하고 싶어?`,
        (a: string) => `"${a}" — 만약 그게 불가능하다면?`,
        (a: string) => `"${a}" — 언제부터 그렇게 느꼈어?`,
        (a: string) => `"${a}" — 그 안에 숨겨진 감정은 뭘까?`,
        (a: string) => `"${a}" — 5년 후에도 같은 답일까?`,
        (a: string) => `"${a}" — 그걸 한 문장으로 정리하면?`,
        (a: string) => `"${a}" — 누군가에게 설명한다면 어떻게 말할까?`,
      ];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      setCurrentQ(pattern(currentAnswer.trim()));
    }
    setCurrentAnswer("");
  };

  const reset = () => {
    setChain([]);
    setCurrentAnswer("");
    setNextQuestion("");
    setStarted(false);
    setCurrentQ("");
    setViewMode("list");
  };

  return (
    <div className="space-y-6">
      {!started ? (
        <div className="text-center space-y-4">
          <div className="bg-card border-2 border-primary/20 rounded-xl p-8 shadow-sm space-y-3">
            <CornerDownRight className="h-8 w-8 mx-auto text-primary/60" />
            <p className="text-lg font-bold text-foreground">꼬리에 꼬리를 무는 질문</p>
            <p className="text-sm text-muted-foreground">
              하나의 질문에서 시작해 꼬리를 물며 깊이 사고해보세요
            </p>
          </div>
          <Button onClick={startWithRandom} className="w-full gap-2 h-12 rounded-xl text-base font-semibold shadow-md">
            <CornerDownRight className="h-4 w-4" />
            랜덤 질문으로 시작하기
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* View mode toggle */}
          {chain.length > 0 && (
            <div className="flex gap-1.5">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors font-semibold ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                목록
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors font-semibold ${
                  viewMode === "timeline"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                타임라인
              </button>
            </div>
          )}

          {/* Chain history - list view */}
          {viewMode === "list" && chain.length > 0 && (
            <div className="space-y-3">
              {chain.map((pair, i) => (
                <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-2 mb-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: DOTS[i % 10] }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-muted-foreground">Q{i + 1}</p>
                      <p className="text-sm font-medium text-foreground">{pair.question}</p>
                    </div>
                  </div>
                  <div className="ml-5 bg-card border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground shadow-sm">
                    {pair.answer}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chain history - timeline view */}
          {viewMode === "timeline" && <ChainTimeline chain={chain} />}

          {/* Current question */}
          <div className="bg-card border-2 border-primary/20 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-xs font-semibold text-primary/70 mb-1">Q{chain.length + 1}</p>
            <p className="text-lg font-bold text-foreground">{currentQ}</p>
          </div>

          {/* Answer input */}
          <div className="space-y-3">
            <Input
              placeholder="당신의 답변을 적어보세요..."
              value={currentAnswer}
              maxLength={MAX_LENGTH}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
              className="h-12 rounded-xl border-2 border-border/60 focus-visible:ring-primary/30 bg-card shadow-sm text-base"
            />
            <Input
              placeholder="다음 질문 직접 입력 (비우면 자동 생성)"
              value={nextQuestion}
              maxLength={MAX_LENGTH}
              onChange={(e) => setNextQuestion(e.target.value)}
              className="h-10 rounded-xl border border-border/40 focus-visible:ring-primary/20 bg-card/50 shadow-sm text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={submitAnswer} disabled={!currentAnswer.trim()} className="flex-1 gap-2 h-11 rounded-xl font-semibold shadow-md">
                <Plus className="h-4 w-4" />
                답변하고 다음 질문으로
              </Button>
              <Button onClick={skipToNewQuestion} variant="outline" size="icon" className="h-11 w-11 rounded-xl shadow-sm" title="새 질문으로 건너뛰기">
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button onClick={rerollQuestion} variant="outline" size="icon" className="h-11 w-11 rounded-xl shadow-sm" title="질문 다시 선택">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={reset} variant="outline" size="icon" className="h-11 w-11 rounded-xl shadow-sm" title="처음부터 다시">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Depth indicator */}
          {chain.length > 0 && viewMode === "list" && (
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                🔗 사고의 깊이: {chain.length}단계
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChainQuestion;
