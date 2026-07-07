import { readStorageJSON, writeStorageJSON } from "@/lib/storage";

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
const CATEGORIES_KEY = "inspiration-categories";

const isSessionType = (value: unknown): value is SavedSession["type"] =>
  value === "mindmap" || value === "chain";

const normalizeThoughts = (thoughts: unknown): string[] => {
  if (!Array.isArray(thoughts)) {
    return [];
  }

  return thoughts.flatMap((item) => {
    if (typeof item === "string") {
      return item;
    }

    if (
      item &&
      typeof item === "object" &&
      "text" in item &&
      typeof item.text === "string"
    ) {
      return item.text;
    }

    return [];
  });
};

const normalizeChainData = (
  chainData: unknown,
): SavedSession["chainData"] => {
  if (!Array.isArray(chainData)) {
    return undefined;
  }

  const normalized = chainData.flatMap((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      !("question" in item) ||
      !("answer" in item) ||
      typeof item.question !== "string" ||
      typeof item.answer !== "string"
    ) {
      return [];
    }

    return [{ question: item.question, answer: item.answer }];
  });

  return normalized.length > 0 ? normalized : undefined;
};

const normalizeSession = (value: unknown): SavedSession | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<SavedSession>;

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.title !== "string" ||
    !isSessionType(candidate.type) ||
    typeof candidate.keyword !== "string" ||
    typeof candidate.createdAt !== "number"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    title: candidate.title,
    type: candidate.type,
    category:
      typeof candidate.category === "string" ? candidate.category : undefined,
    keyword: candidate.keyword,
    thoughts: normalizeThoughts(candidate.thoughts),
    chainData: normalizeChainData(candidate.chainData),
    createdAt: candidate.createdAt,
  };
};

export const loadSessions = (): SavedSession[] => {
  const sessions = readStorageJSON<unknown[]>(SESSIONS_KEY, []);
  return sessions.flatMap((session) => {
    const normalized = normalizeSession(session);
    return normalized ? [normalized] : [];
  });
};

export const saveSessions = (sessions: SavedSession[]) => {
  writeStorageJSON(SESSIONS_KEY, sessions);
};

export const loadCustomCategories = (): string[] => {
  const categories = readStorageJSON<unknown[]>(CATEGORIES_KEY, []);
  return categories.filter((category): category is string => typeof category === "string");
};

export const saveCustomCategories = (categories: string[]) => {
  writeStorageJSON(CATEGORIES_KEY, categories);
};
