import { useState, useMemo } from "react";
import { Brain, MessageCircleQuestion, Search, Plus, Trash2, FileText, Tag, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

export interface SavedSession {
  id: string;
  title: string;
  type: "mindmap" | "chain";
  category?: string;
  keyword: string;
  thoughts: string[];
  chainData?: { question: string; answer: string }[];
  createdAt: number;
}

const SESSIONS_KEY = "inspiration-sessions";

export const loadSessions = (): SavedSession[] => {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

export const saveSessions = (sessions: SavedSession[]) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

interface AppSidebarProps {
  activeSessionId: string | null;
  onSelectSession: (session: SavedSession) => void;
  onNewSession: () => void;
  sessions: SavedSession[];
  onDeleteSession: (id: string) => void;
}

const AppSidebar = ({ activeSessionId, onSelectSession, onNewSession, sessions, onDeleteSession }: AppSidebarProps) => {
  const [search, setSearch] = useState("");

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = sessions.map(({ id, title, type, category, keyword, thoughts, chainData, createdAt }) => ({
      id, title, type, category: category || "미분류", keyword, thoughts, chainData, createdAt: new Date(createdAt).toISOString(),
    }));
    downloadFile(JSON.stringify(data, null, 2), `inspiration-lab-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
  };

  const exportCSV = () => {
    const header = "제목,유형,분야,키워드,생각들,생성일";
    const rows = sessions.map((s) =>
      [s.title, s.type === "mindmap" ? "마인드맵" : "꼬리질문", s.category || "미분류", s.keyword, `"${s.thoughts.join(", ")}"`, new Date(s.createdAt).toISOString().slice(0, 10)].join(",")
    );
    const bom = "\uFEFF";
    downloadFile(bom + [header, ...rows].join("\n"), `inspiration-lab-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8");
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.trim().toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.keyword.toLowerCase().includes(q) ||
        s.thoughts.some((t) => t.toLowerCase().includes(q))
    );
  }, [sessions, search]);

  const categories = useMemo(() => {
    const map = new Map<string, SavedSession[]>();
    filtered.forEach((s) => {
      const cat = s.category || "미분류";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    });
    return map;
  }, [filtered]);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm text-sidebar-foreground">내 기록</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs rounded-lg bg-sidebar-accent border-none"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {Array.from(categories.entries()).map(([cat, catSessions]) => (
          <SidebarGroup key={cat}>
            <SidebarGroupLabel>
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              {cat}
              <span className="ml-auto text-[10px] text-muted-foreground">{catSessions.length}</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {catSessions.map((s) => (
                  <SidebarMenuItem key={s.id}>
                    <SidebarMenuButton
                      isActive={activeSessionId === s.id}
                      onClick={() => onSelectSession(s)}
                      className="group/item"
                    >
                      {s.type === "mindmap" ? (
                        <Brain className="h-3 w-3 shrink-0 text-muted-foreground" />
                      ) : (
                        <MessageCircleQuestion className="h-3 w-3 shrink-0 text-muted-foreground" />
                      )}
                      <span className="flex-1 truncate text-xs">{s.title || s.keyword}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                        className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            {search ? "검색 결과가 없습니다" : "저장된 기록이 없습니다"}
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        <Button onClick={onNewSession} variant="outline" size="sm" className="w-full gap-1.5 rounded-lg text-xs">
          <Plus className="h-3.5 w-3.5" />
          새 세션
        </Button>
        {sessions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full gap-1.5 rounded-lg text-xs text-muted-foreground">
                <Download className="h-3.5 w-3.5" />
                데이터 내보내기
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40">
              <DropdownMenuItem onClick={exportJSON} className="text-xs cursor-pointer">
                JSON으로 내보내기
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportCSV} className="text-xs cursor-pointer">
                CSV로 내보내기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
