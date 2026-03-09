import { useMemo } from "react";
import { Brain, MessageCircleQuestion, TrendingUp, Clock, Award, Layers, Hash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SavedSession } from "@/components/AppSidebar";

interface StatsDashboardProps {
  sessions: SavedSession[];
}

const StatsDashboard = ({ sessions }: StatsDashboardProps) => {
  const stats = useMemo(() => {
    const mindmapSessions = sessions.filter((s) => s.type === "mindmap");
    const chainSessions = sessions.filter((s) => s.type === "chain");

    const avgDepth = chainSessions.length > 0
      ? Math.round(chainSessions.reduce((sum, s) => sum + (s.chainData?.length || 0), 0) / chainSessions.length * 10) / 10
      : 0;

    const maxDepth = chainSessions.reduce((max, s) => Math.max(max, s.chainData?.length || 0), 0);
    const totalThoughts = mindmapSessions.reduce((sum, s) => sum + s.thoughts.length, 0);

    const catMap = new Map<string, number>();
    sessions.forEach((s) => {
      const cat = s.category || "미분류";
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    const topCategories = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentCount = sessions.filter((s) => s.createdAt > weekAgo).length;

    // Heatmap: last 16 weeks
    const dayMs = 24 * 60 * 60 * 1000;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = today.getTime();
    const todayDay = today.getDay();
    const totalDays = 16 * 7;
    const startOffset = totalDays - 1 + todayDay;
    const startTs = todayTs - startOffset * dayMs;

    const dayCountMap = new Map<string, number>();
    sessions.forEach((s) => {
      const d = new Date(s.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      dayCountMap.set(key, (dayCountMap.get(key) || 0) + 1);
    });

    const heatmapWeeks: { date: Date; count: number }[][] = [];
    let week: { date: Date; count: number }[] = [];
    for (let i = 0; i <= startOffset + (6 - todayDay); i++) {
      const date = new Date(startTs + i * dayMs);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const count = dayCountMap.get(key) || 0;
      const isFuture = date.getTime() > todayTs;
      week.push({ date, count: isFuture ? -1 : count });
      if (week.length === 7) {
        heatmapWeeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) heatmapWeeks.push(week);

    const maxCount = Math.max(1, ...Array.from(dayCountMap.values()));

    // Keyword TOP 10
    const kwMap = new Map<string, number>();
    sessions.forEach((s) => {
      // Count main keyword
      if (s.keyword?.trim()) {
        const kw = s.keyword.trim();
        kwMap.set(kw, (kwMap.get(kw) || 0) + 1);
      }
      // Count individual thoughts as keywords
      s.thoughts.forEach((t) => {
        const word = (typeof t === "string" ? t : t).trim();
        if (word) kwMap.set(word, (kwMap.get(word) || 0) + 1);
      });
    });
    const topKeywords = Array.from(kwMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const maxKwCount = topKeywords.length > 0 ? topKeywords[0][1] : 1;

    // Month labels for heatmap
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    heatmapWeeks.forEach((week, wi) => {
      const firstDay = week.find((d) => d.count !== -1);
      if (firstDay) {
        const m = firstDay.date.getMonth();
        if (m !== lastMonth) {
          monthLabels.push({ label: `${m + 1}월`, weekIndex: wi });
          lastMonth = m;
        }
      }
    });

    return { mindmapSessions: mindmapSessions.length, chainSessions: chainSessions.length, avgDepth, maxDepth, totalThoughts, topCategories, recentCount, heatmapWeeks, maxCount, topKeywords, maxKwCount, monthLabels };
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">아직 세션 데이터가 없습니다</p>
        <p className="text-xs text-muted-foreground/70">마인드맵이나 꼬리질문을 시작하면 통계가 표시됩니다</p>
      </div>
    );
  }

  const statCards = [
    { label: "전체 세션", value: sessions.length, icon: Layers, color: "hsl(var(--primary))" },
    { label: "마인드맵", value: stats.mindmapSessions, icon: Brain, color: "#A7C7E7" },
    { label: "꼬리질문", value: stats.chainSessions, icon: MessageCircleQuestion, color: "#F4B6C2" },
    { label: "총 생각 수", value: stats.totalThoughts, icon: TrendingUp, color: "#B5EAD7" },
    { label: "최대 사고 깊이", value: `${stats.maxDepth}단계`, icon: Award, color: "#FFE0AC" },
    { label: "최근 7일", value: `${stats.recentCount}개`, icon: Clock, color: "#C3B1E1" },
  ];

  const getHeatColor = (level: number) => {
    switch (level) {
      case 1: return "hsl(var(--primary) / 0.25)";
      case 2: return "hsl(var(--primary) / 0.5)";
      case 3: return "hsl(var(--primary) / 0.75)";
      case 4: return "hsl(var(--primary))";
      default: return "hsl(var(--muted))";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border-2 border-primary/20 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-1">📊 나의 탐구 통계</h2>
        <p className="text-xs text-muted-foreground">지금까지의 사고 여정을 한눈에 확인하세요</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}30` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Activity Heatmap */}
      <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-3">🌱 활동 잔디밭</p>
        <TooltipProvider delayDuration={100}>
          <div className="overflow-x-auto">
            {/* Month labels */}
            <div className="flex gap-[3px] mb-1 ml-0">
              {stats.heatmapWeeks.map((_, wi) => {
                const ml = stats.monthLabels.find((m) => m.weekIndex === wi);
                return (
                  <div key={wi} className="w-[11px] text-center">
                    {ml ? <span className="text-[9px] text-muted-foreground leading-none">{ml.label}</span> : null}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-[3px]">
              {stats.heatmapWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => {
                    if (day.count === -1) {
                      return <div key={di} className="w-[11px] h-[11px]" />;
                    }
                    const level = day.count === 0 ? 0 : Math.min(4, Math.ceil(day.count / stats.maxCount * 4));
                    const dateStr = `${day.date.getMonth() + 1}/${day.date.getDate()}`;
                    return (
                      <Tooltip key={di}>
                        <TooltipTrigger asChild>
                          <div
                            className="w-[11px] h-[11px] rounded-[2px] transition-colors"
                            style={{ backgroundColor: getHeatColor(level) }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {dateStr}: {day.count}개 세션
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-[10px] text-muted-foreground mr-1">적음</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: getHeatColor(level) }}
            />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">많음</span>
        </div>
      </div>

      {stats.avgDepth > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-1">평균 사고 깊이</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-foreground">{stats.avgDepth}</span>
            <span className="text-sm text-muted-foreground pb-1">단계</span>
          </div>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(stats.avgDepth / 10 * 100, 100)}%`,
                background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))",
              }}
            />
          </div>
        </div>
      )}

      {/* Keyword TOP 10 */}
      {stats.topKeywords.length > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-3">🔑 자주 사용한 키워드 TOP 10</p>
          <div className="space-y-2">
            {stats.topKeywords.map(([kw, count], i) => {
              const pct = Math.round(count / stats.maxKwCount * 100);
              return (
                <div key={kw} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary w-5 text-right">{i + 1}</span>
                  <span className="text-xs text-foreground w-24 truncate font-medium">{kw}</span>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{
                        width: `${Math.max(pct, 8)}%`,
                        background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.5))",
                      }}
                    >
                      <span className="text-[10px] font-bold text-primary-foreground">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats.topCategories.length > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-3">자주 탐구한 분야</p>
          <div className="space-y-2">
            {stats.topCategories.map(([cat, count]) => {
              const pct = Math.round(count / sessions.length * 100);
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-foreground w-20 truncate font-medium">{cat}</span>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{
                        width: `${Math.max(pct, 8)}%`,
                        background: "linear-gradient(90deg, hsl(var(--primary) / 0.7), hsl(var(--primary) / 0.4))",
                      }}
                    >
                      <span className="text-[10px] font-bold text-primary-foreground">{count}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsDashboard;
