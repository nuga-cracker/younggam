import { useMemo } from "react";
import { Brain, MessageCircleQuestion, TrendingUp, Clock, Award, Layers } from "lucide-react";
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

    // Category frequency
    const catMap = new Map<string, number>();
    sessions.forEach((s) => {
      const cat = s.category || "미분류";
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    const topCategories = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Recent activity (last 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentCount = sessions.filter((s) => s.createdAt > weekAgo).length;

    return { mindmapSessions: mindmapSessions.length, chainSessions: chainSessions.length, avgDepth, maxDepth, totalThoughts, topCategories, recentCount };
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
