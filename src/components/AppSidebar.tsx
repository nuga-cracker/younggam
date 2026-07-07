import { useState, useMemo } from "react";
import { Brain, MessageCircleQuestion, Search, Plus, Trash2, FileText, Tag, Download, Pencil, Check, X, FolderPlus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SavedSession } from "@/lib/sessions";
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

interface AppSidebarProps {
  activeSessionId: string | null;
  onSelectSession: (session: SavedSession) => void;
  onNewSession: () => void;
  sessions: SavedSession[];
  onDeleteSession: (id: string) => void;
  onUpdateSessionCategory: (sessionId: string, category: string) => void;
  customCategories: string[];
  onAddCategory: (name: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
}

const AppSidebar = ({
  activeSessionId, onSelectSession, onNewSession, sessions, onDeleteSession,
  onUpdateSessionCategory, customCategories, onAddCategory, onRenameCategory, onDeleteCategory,
}: AppSidebarProps) => {
  const [search, setSearch] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");

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
    const escapeCSV = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const header = "제목,유형,분야,키워드,생각들,생성일";
    const rows = sessions.map((s) =>
      [
        escapeCSV(s.title),
        escapeCSV(s.type === "mindmap" ? "마인드맵" : "꼬리질문"),
        escapeCSV(s.category || "미분류"),
        escapeCSV(s.keyword),
        escapeCSV(s.thoughts.join(", ")),
        escapeCSV(new Date(s.createdAt).toISOString().slice(0, 10)),
      ].join(",")
    );
    const bom = "\uFEFF";
    downloadFile(bom + [header, ...rows].join("\n"), `inspiration-lab-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8");
  };

  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setNewCatName("");
    setShowAddCat(false);
  };

  const handleRenameCategory = (oldName: string) => {
    const trimmed = editCatName.trim();
    if (!trimmed || trimmed === oldName) { setEditingCat(null); return; }
    onRenameCategory(oldName, trimmed);
    setEditingCat(null);
    setEditCatName("");
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

  // Build categories: custom order first, then auto-detected ones
  const categories = useMemo(() => {
    const map = new Map<string, SavedSession[]>();
    filtered.forEach((s) => {
      const cat = s.category || "미분류";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    });
    // Order: custom categories first (even if empty), then remaining
    const ordered = new Map<string, SavedSession[]>();
    customCategories.forEach((c) => {
      ordered.set(c, map.get(c) || []);
      map.delete(c);
    });
    map.forEach((v, k) => ordered.set(k, v));
    return ordered;
  }, [filtered, customCategories]);

  // All unique category names for the move menu
  const allCategoryNames = useMemo(() => {
    const names = new Set(customCategories);
    sessions.forEach((s) => { if (s.category) names.add(s.category); });
    names.add("미분류");
    return Array.from(names);
  }, [sessions, customCategories]);

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

        {/* Add category */}
        {showAddCat ? (
          <div className="flex gap-1.5 mt-2">
            <Input
              placeholder="새 분류 이름"
              value={newCatName}
              maxLength={15}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              className="h-7 text-xs rounded-md bg-sidebar-accent border-none flex-1"
              autoFocus
            />
            <button onClick={handleAddCategory} className="text-primary hover:text-primary/80 transition-colors">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => { setShowAddCat(false); setNewCatName(""); }} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddCat(true)}
            className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full px-1"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            분류 추가
          </button>
        )}
      </SidebarHeader>

      <SidebarContent>
        {Array.from(categories.entries()).map(([cat, catSessions]) => (
          <SidebarGroup key={cat}>
            <SidebarGroupLabel className="group/cat">
              {editingCat === cat ? (
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleRenameCategory(cat); if (e.key === "Escape") setEditingCat(null); }}
                    className="h-5 text-[11px] rounded px-1 bg-sidebar-accent border-none w-full"
                    maxLength={15}
                    autoFocus
                  />
                  <button onClick={() => handleRenameCategory(cat)} className="text-primary shrink-0">
                    <Check className="h-3 w-3" />
                  </button>
                  <button onClick={() => setEditingCat(null)} className="text-muted-foreground shrink-0">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <Tag className="h-3.5 w-3.5 mr-1.5" />
                  {cat}
                  <span className="ml-auto text-[10px] text-muted-foreground">{catSessions.length}</span>
                  {cat !== "미분류" && (
                    <div className="ml-1.5 flex gap-0.5 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingCat(cat); setEditCatName(cat); }}
                        className="text-muted-foreground hover:text-foreground"
                        title="분류 이름 수정"
                      >
                        <Pencil className="h-2.5 w-2.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteCategory(cat); }}
                        className="text-muted-foreground hover:text-destructive"
                        title="분류 삭제"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
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
                      <div className="flex gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        {/* Move to category */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="분류 이동"
                            >
                              <Tag className="h-3 w-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            {allCategoryNames.map((c) => (
                              <DropdownMenuItem
                                key={c}
                                onClick={(e) => { e.stopPropagation(); onUpdateSessionCategory(s.id, c); }}
                                className={`text-xs cursor-pointer ${s.category === c ? "font-bold" : ""}`}
                              >
                                {c}
                                {s.category === c && <Check className="h-3 w-3 ml-auto" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {catSessions.length === 0 && (
                  <div className="px-3 py-2 text-[10px] text-muted-foreground/60 italic">비어 있음</div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {filtered.length === 0 && categories.size === 0 && (
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
