const PREFIX = "[Perf]";
const DEBUG_ENABLED = __DEV__ || process.env.EXPO_PUBLIC_PERF_DEBUG === "true";

const marks = new Map<string, number>();

function shouldLog(): boolean {
  return DEBUG_ENABLED;
}

function now(): number {
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    return performance.now();
  }
  return Date.now();
}

export function perfMark(name: string): void {
  if (!shouldLog()) return;
  marks.set(name, now());
}

export function perfMeasure(name: string, startMark: string): number | null {
  if (!shouldLog()) return null;
  const start = marks.get(startMark);
  if (typeof start !== "number") return null;
  marks.delete(startMark);

  const duration = now() - start;
  console.log(`${PREFIX} ${name}: ${duration.toFixed(1)}ms`);
  return duration;
}

export function perfLog(message: string, data?: Record<string, unknown>): void {
  if (!shouldLog()) return;
  if (data) {
    console.log(`${PREFIX} ${message}`, data);
    return;
  }
  console.log(`${PREFIX} ${message}`);
}
