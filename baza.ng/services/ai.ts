import type {
    AIChatMessage,
    AIChatResponse,
    AISession,
    AISuggestion,
    Pagination,
} from "../types";
import { logRequest, logResponse, logError } from "../utils/aiChatLogger";
import api from "./api";

export async function getSuggestions(): Promise<AISuggestion[]> {
  const { data } = await api.get("/ai/suggestions");
  return data.suggestions ?? [];
}

export async function listSessions(
  page = 1,
  limit = 20,
): Promise<{ sessions: AISession[]; pagination: Pagination }> {
  const { data } = await api.get("/ai/sessions", { params: { page, limit } });
  return data;
}

export async function createSession(title?: string): Promise<AISession> {
  const payload = title?.trim() ? { title: title.trim() } : {};
  const { data } = await api.post("/ai/sessions", payload);
  return data.session;
}

export async function getHistory(
  sessionId: string,
  page = 1,
  limit = 50,
): Promise<{ messages: AIChatMessage[]; pagination?: Pagination }> {
  const { data } = await api.get("/ai/history", {
    params: { sessionId, page, limit },
  });
  return data;
}

export async function sendChat(
  message: string,
  sessionId?: string,
): Promise<AIChatResponse> {
  const payload: { message: string; sessionId?: string } = {
    message,
  };
  if (sessionId) payload.sessionId = sessionId;

  logRequest(payload);

  try {
    const { data } = await api.post("/ai/chat", payload, { timeout: 60_000 });

    const msg = data?.message ?? {};
    logResponse({
      messageId: msg.id ?? "unknown",
      content: msg.content ?? "",
      messageType: msg.messageType,
      metadata: msg.metadata as Record<string, unknown> | undefined,
    });

    return data;
  } catch (err) {
    logError("sendChat", err);
    throw err;
  }
}
