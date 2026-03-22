// Simple JSON logger for Next.js API routes
// Logs to stdout in structured JSON format suitable for ELK/Grafana collection

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  ip?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

export function log(
  level: LogLevel,
  message: string,
  meta?: Partial<LogEntry>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  const output = JSON.stringify(entry);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

// Helper to log slow requests
export function logSlowRequest(
  path: string,
  method: string,
  durationMs: number,
  threshold = 2000
): void {
  if (durationMs > threshold) {
    log("warn", `Slow request detected: ${method} ${path} took ${durationMs}ms`, {
      path,
      method,
      durationMs,
    });
  }
}
