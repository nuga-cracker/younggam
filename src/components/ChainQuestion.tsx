import { useState } from "react";
import { Plus, CornerDownRight, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const ChainQuestion = () => {
  const [chain, setChain] = useState<QAPair[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [nextQuestion, setNextQuestion] = useState("");
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState("");

  const startWithRandom = () => {
    const q = STARTER_QUESTIONS[Math.floor(Math.random() * STARTER_QUESTIONS.length)];
    setCurrentQ(q);
    setChain([]);
    setCurrentAnswer("");
    setNextQuestion("");
    setStarted(true);
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
      // Auto-generate follow-up from the answer
      setCurrentQ(`"${currentAnswer.trim()}" — 왜 그렇게 생각해?`);
    }
    setCurrentAnswer("");
  };

  const reset = () => {
    setChain([]);
    setCurrentAnswer("");
    setNextQuestion("");
    setStarted(false);
    setCurrentQ("");
  };

  const DOTS = ["#A7C7E7","#F4B6C2","#B5EAD7","#FFE0AC","#C3B1E1","#FFDAC1","#B5D8EB","#E2C2E9","#C7CEEA","#F5CAC3"];

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
          {/* Chain history */}
          {chain.length > 0 && (
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
              <Button onClick={reset} variant="outline" size="icon" className="h-11 w-11 rounded-xl shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Depth indicator */}
          {chain.length > 0 && (
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
