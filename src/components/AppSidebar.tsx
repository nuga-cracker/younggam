import { useState, useMemo } from "react";
import { Brain, MessageCircleQuestion, Search, Plus, Trash2, FileText } from "lucide-react";
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

  const mindmapSessions = filtered.filter((s) => s.type === "mindmap");
  const chainSessions = filtered.filter((s) => s.type === "chain");

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
        {mindmapSessions.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <Brain className="h-3.5 w-3.5 mr-1.5" />
              마인드맵
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mindmapSessions.map((s) => (
                  <SidebarMenuItem key={s.id}>
                    <SidebarMenuButton
                      isActive={activeSessionId === s.id}
                      onClick={() => onSelectSession(s)}
                      className="group/item"
                    >
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
        )}

        {chainSessions.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <MessageCircleQuestion className="h-3.5 w-3.5 mr-1.5" />
              꼬리질문
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {chainSessions.map((s) => (
                  <SidebarMenuItem key={s.id}>
                    <SidebarMenuButton
                      isActive={activeSessionId === s.id}
                      onClick={() => onSelectSession(s)}
                      className="group/item"
                    >
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
        )}

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            {search ? "검색 결과가 없습니다" : "저장된 기록이 없습니다"}
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Button onClick={onNewSession} variant="outline" size="sm" className="w-full gap-1.5 rounded-lg text-xs">
          <Plus className="h-3.5 w-3.5" />
          새 세션
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
