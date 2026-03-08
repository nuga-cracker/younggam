import { useState, useEffect } from "react";
import { Brain, MessageCircleQuestion, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ONBOARDING_KEY = "inspiration-onboarding-seen";

const OnboardingGuide = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY);
    if (!seen) setShow(true);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
  };

  if (!show) return null;

  const steps = [
    {
      icon: Brain,
      title: "마인드맵으로 생각 펼치기",
      desc: "키워드를 입력하고 짧은 생각들을 추가하면 5가지 시각화로 아이디어를 확장할 수 있어요.",
      color: "#A7C7E7",
    },
    {
      icon: MessageCircleQuestion,
      title: "꼬리질문으로 깊이 사고하기",
      desc: "하나의 질문에서 시작해 꼬리를 물며 생각을 깊이 탐구해보세요. 사고의 흐름이 타임라인으로 기록됩니다.",
      color: "#F4B6C2",
    },
    {
      icon: BarChart3,
      title: "통계로 나의 사고 여정 확인",
      desc: "모든 세션은 자동 저장되고, 통계 대시보드에서 탐구 패턴을 분석할 수 있어요.",
      color: "#B5EAD7",
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border-2 border-border/50 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{ backgroundColor: `${current.color}30` }}
          >
            <Icon className="h-8 w-8" style={{ color: current.color }} />
          </div>
          <h3 className="text-lg font-bold text-foreground">{current.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.desc}</p>

          <div className="flex items-center justify-center gap-1.5 py-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={dismiss} variant="ghost" className="flex-1 rounded-xl text-sm">
              건너뛰기
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="flex-1 rounded-xl text-sm font-semibold">
                다음
              </Button>
            ) : (
              <Button onClick={dismiss} className="flex-1 rounded-xl text-sm font-semibold">
                시작하기 ✨
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
