/**
 * AI Chat logging utility for diagnosing tool calls, errors, and responses.
 * Logs are prefixed with [AI Chat] for easy filtering in dev tools.
 * Enable with __DEV__ or set EXPO_PUBLIC_AI_CHAT_DEBUG=true for production debugging.
 */

const PREFIX = "[AI Chat]";
const DEBUG_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_AI_CHAT_DEBUG === "true";

function shouldLog(): boolean {
  return DEBUG_ENABLED;
}

export interface ToolCallLog {
  name: string;
  arguments?: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

export function logRequest(payload: {
  message: string;
  sessionId?: string;
}): void {
  if (!shouldLog()) return;
  console.log(`${PREFIX} Request:`, {
    message: payload.message.slice(0, 100),
    messageLength: payload.message.length,
    sessionId: payload.sessionId ?? "(new session)",
    timestamp: new Date().toISOString(),
  });
}

export function logResponse(payload: {
  messageId: string;
  content: string;
  messageType?: string;
  metadata?: Record<string, unknown>;
}): void {
  if (!shouldLog()) return;
  const meta = payload.metadata ?? {};
  const toolCalls = (meta.toolCalls ?? meta.tool_calls ?? []) as Array<{
    name?: string;
    arguments?: Record<string, unknown>;
    result?: unknown;
    error?: string;
  }>;
  const toolResults = (meta.toolResults ?? meta.tool_results ?? []) as Array<{
    name?: string;
    result?: unknown;
    error?: string;
  }>;

  console.log(`${PREFIX} Response:`, {
    messageId: payload.messageId,
    contentPreview: payload.content.slice(0, 150),
    messageType: payload.messageType,
    timestamp: new Date().toISOString(),
  });

  if (toolCalls.length > 0) {
    console.log(`${PREFIX} Tool calls (${toolCalls.length}):`, toolCalls);
    toolCalls.forEach((tc, i) => {
      console.log(`${PREFIX}   [${i + 1}] ${tc.name ?? "unknown"}`, {
        arguments: tc.arguments,
        result: tc.result,
        error: tc.error,
      });
    });
  }

  if (toolResults.length > 0) {
    console.log(`${PREFIX} Tool results (${toolResults.length}):`, toolResults);
    toolResults.forEach((tr, i) => {
      const hasError = !!tr.error;
      const logFn = hasError ? console.warn : console.log;
      logFn(`${PREFIX}   [${i + 1}] ${tr.name ?? "unknown"}`, {
        result: tr.result,
        error: tr.error,
      });
    });
  }

  if (payload.content.toLowerCase().includes("error")) {
    console.warn(`${PREFIX} AI response contains error wording:`, {
      content: payload.content,
      metadata: meta,
    });
  }
}

export function logToolCalls(
  toolCalls: Array<{ name?: string; arguments?: Record<string, unknown> }>,
  context?: string,
): void {
  if (!shouldLog() || toolCalls.length === 0) return;
  console.log(`${PREFIX} Tool calls${context ? ` (${context})` : ""}:`, toolCalls);
  toolCalls.forEach((tc, i) => {
    console.log(`${PREFIX}   ${tc.name ?? "unknown"}`, tc.arguments ?? {});
  });
}

export function logError(context: string, error: unknown): void {
  if (!shouldLog()) return;
  console.error(`${PREFIX} Error [${context}]:`, error);
  if (error instanceof Error) {
    console.error(`${PREFIX}   Stack:`, error.stack);
  }
}

/** Logs diagnostic info (e.g. AI reported error in content) as warning, not error. */
export function logWarn(context: string, data: unknown): void {
  if (!shouldLog()) return;
  console.warn(`${PREFIX} [${context}]:`, data);
}

/**
 * Logs tool failures with full arguments and parsed error for debugging.
 * Use when AI reports error and we have toolCalls + toolResults.
 */
export function logToolFailure(
  toolCalls: Array<{ name?: string; arguments?: Record<string, unknown> }>,
  toolResults: Array<{ name?: string; result?: unknown; error?: string }>,
): void {
  if (!shouldLog() || toolResults.length === 0) return;
  toolResults.forEach((tr, i) => {
    const tc = toolCalls[i] ?? toolCalls.find((t) => t.name === tr.name);
    const name = tr.name ?? tc?.name ?? "unknown";
    const args = tc?.arguments ?? {};
    let errorMsg = tr.error;
    let parsedResult: unknown = tr.result;

    if (typeof tr.result === "string") {
      try {
        parsedResult = JSON.parse(tr.result) as Record<string, unknown>;
        if (parsedResult && typeof parsedResult === "object" && "error" in parsedResult) {
          errorMsg = String((parsedResult as Record<string, unknown>).error);
        }
      } catch {
        parsedResult = tr.result;
      }
    }

    const hasError =
      errorMsg ||
      (parsedResult &&
        typeof parsedResult === "object" &&
        "error" in (parsedResult as object));
    if (hasError) {
      const err = errorMsg ?? (parsedResult as Record<string, unknown>)?.error;
      console.warn(`${PREFIX} Tool failure [${name}]:`, {
        arguments: JSON.parse(JSON.stringify(args)),
        error: err,
        rawResult: tr.result,
      });
    }
  });
}

export function logCartSync(reason: string): void {
  if (!shouldLog()) return;
  console.log(`${PREFIX} Cart sync triggered:`, reason);
}
