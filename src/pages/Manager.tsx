import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, MessageCircleQuestion, Search, Trash2, Eye, ChevronDown, ChevronUp, Calendar, Tag, Lock, Globe, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { loadSessions, type SavedSession } from "@/components/AppSidebar";

const ADMIN_PASSWORD = "77457745";

const Manager = () => {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("admin_auth") === "true");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sessions] = useState<SavedSession[]>(loadSessions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"createdAt" | "title">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null);

  const [seo, setSeo] = useState(() => {
    const saved = localStorage.getItem("seo_meta");
    return saved ? JSON.parse(saved) : {
      title: "younggam",
      description: "생각을 확장하고 깊이 탐구하는 영감 연구소",
      ogTitle: "younggam",
      ogDescription: "생각을 확장하고 깊이 탐구하는 영감 연구소",
      keywords: "",
    };
  });
  const [seoSaved, setSeoSaved] = useState(false);

  const handleSeoSave = () => {
    localStorage.setItem("seo_meta", JSON.stringify(seo));
    document.title = seo.title;
    const setMeta = (sel: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute("content", val);
    };
    setMeta('meta[name="description"]', seo.description);
    setMeta('meta[property="og:title"]', seo.ogTitle);
    setMeta('meta[property="og:description"]', seo.ogDescription);
    setMeta('meta[name="twitter:title"]', seo.ogTitle);
    setMeta('meta[name="twitter:description"]', seo.ogDescription);
    if (seo.keywords) {
      let kw = document.querySelector('meta[name="keywords"]');
      if (!kw) { kw = document.createElement("meta"); kw.setAttribute("name", "keywords"); document.head.appendChild(kw); }
      kw.setAttribute("content", seo.keywords);
    }
    setSeoSaved(true);
    setTimeout(() => setSeoSaved(false), 2000);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => set.add(s.category || "미분류"));
    return Array.from(set).sort();
  }, [sessions]);

  const filtered = useMemo(() => {
    let result = [...sessions];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.keyword.toLowerCase().includes(q) ||
          s.thoughts.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((s) => s.type === typeFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter((s) => (s.category || "미분류") === categoryFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt") cmp = a.createdAt - b.createdAt;
      else cmp = a.title.localeCompare(b.title);
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [sessions, search, typeFilter, categoryFilter, sortField, sortDir]);

  const toggleSort = (field: "createdAt" | "title") => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDir === "desc" ? <ChevronDown className="h-3 w-3 inline ml-1" /> : <ChevronUp className="h-3 w-3 inline ml-1" />;
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
      setError("");
    } else {
      setError("비밀번호가 올바르지 않습니다");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border/50 rounded-2xl p-8 w-full max-w-sm space-y-6 shadow-lg">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">관리자 인증</h1>
            <p className="text-sm text-muted-foreground">비밀번호를 입력해주세요</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg"
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full rounded-lg">확인</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">📋 관리자 페이지</h1>
            <p className="text-sm text-muted-foreground">전체 세션 기록을 열람하고 관리합니다</p>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            총 <span className="font-bold text-foreground">{sessions.length}</span>개 세션
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-card border border-border/50 rounded-xl p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="제목, 키워드, 생각 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-lg"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] rounded-lg">
              <SelectValue placeholder="유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 유형</SelectItem>
              <SelectItem value="mindmap">마인드맵</SelectItem>
              <SelectItem value="chain">꼬리질문</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] rounded-lg">
              <SelectValue placeholder="분류" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 분류</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-10">#</TableHead>
                <TableHead className="w-10">유형</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => toggleSort("title")}
                >
                  제목 <SortIcon field="title" />
                </TableHead>
                <TableHead>키워드</TableHead>
                <TableHead>분류</TableHead>
                <TableHead className="text-center">생각 수</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => toggleSort("createdAt")}
                >
                  생성일 <SortIcon field="createdAt" />
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    {search || typeFilter !== "all" || categoryFilter !== "all"
                      ? "조건에 맞는 세션이 없습니다"
                      : "저장된 세션이 없습니다"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s, i) => (
                  <TableRow key={s.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => setSelectedSession(s)}>
                    <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      {s.type === "mindmap" ? (
                        <Brain className="h-4 w-4 text-blue-400" />
                      ) : (
                        <MessageCircleQuestion className="h-4 w-4 text-pink-400" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">{s.title || s.keyword}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">{s.keyword}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[11px]">
                        <Tag className="h-2.5 w-2.5" />
                        {s.category || "미분류"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm">{s.thoughts.length}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(s.createdAt)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedSession(s); }}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "마인드맵", value: sessions.filter((s) => s.type === "mindmap").length, color: "text-blue-400" },
            { label: "꼬리질문", value: sessions.filter((s) => s.type === "chain").length, color: "text-pink-400" },
            { label: "분류 수", value: categories.length, color: "text-emerald-400" },
            { label: "총 생각", value: sessions.reduce((sum, s) => sum + s.thoughts.length, 0), color: "text-amber-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border/50 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* SEO Meta Tags */}
        <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-bold text-foreground">SEO 메타 태그 관리</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">페이지 제목 (title)</label>
              <Input value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">키워드 (keywords)</label>
              <Input value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} placeholder="키워드1, 키워드2, ..." className="rounded-lg" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">설명 (description)</label>
              <Textarea value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} className="rounded-lg resize-none" rows={2} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">OG 제목 (og:title)</label>
              <Input value={seo.ogTitle} onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">OG 설명 (og:description)</label>
              <Input value={seo.ogDescription} onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })} className="rounded-lg" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSeoSave} className="rounded-lg gap-2">
              <Save className="h-4 w-4" />
              저장 및 적용
            </Button>
            {seoSaved && <span className="text-sm text-primary animate-in fade-in">✓ 저장되었습니다</span>}
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogTitle className="flex items-center gap-2">
                {selectedSession.type === "mindmap" ? (
                  <Brain className="h-5 w-5 text-blue-400" />
                ) : (
                  <MessageCircleQuestion className="h-5 w-5 text-pink-400" />
                )}
                {selectedSession.title || selectedSession.keyword}
              </DialogTitle>
              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
                    <Calendar className="h-3 w-3" />
                    {formatDate(selectedSession.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted">
                    <Tag className="h-3 w-3" />
                    {selectedSession.category || "미분류"}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-muted">
                    {selectedSession.type === "mindmap" ? "마인드맵" : "꼬리질문"}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">키워드</p>
                  <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2">{selectedSession.keyword}</p>
                </div>

                {selectedSession.type === "chain" && selectedSession.chainData ? (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Q&A 흐름</p>
                    <div className="space-y-2">
                      {selectedSession.chainData.map((qa, i) => (
                        <div key={i} className="bg-muted rounded-lg p-3 space-y-1">
                          <p className="text-xs font-medium text-primary">Q{i + 1}. {qa.question}</p>
                          <p className="text-sm text-foreground">{qa.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">생각들 ({selectedSession.thoughts.length}개)</p>
                    <div className="space-y-1">
                      {selectedSession.thoughts.map((t, i) => (
                        <div key={i} className="text-sm text-foreground bg-muted rounded-lg px-3 py-2">
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Manager;
