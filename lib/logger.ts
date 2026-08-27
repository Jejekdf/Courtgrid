import "server-only";

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  context: string;
  message: string;
  data?: Record<string, unknown>;
  error?: unknown;
}

export function logEvent(level: LogLevel, payload: LogPayload): void {
  const timestamp = new Date().toISOString();
  const formattedError =
    payload.error instanceof Error
      ? { name: payload.error.name, message: payload.error.message, stack: payload.error.stack }
      : payload.error;

  const logObject = {
    timestamp,
    level,
    context: payload.context,
    message: payload.message,
    ...(payload.data ? { data: payload.data } : {}),
    ...(formattedError ? { error: formattedError } : {}),
  };

  if (level === "error") {
    console.error(JSON.stringify(logObject));
  } else if (level === "warn") {
    console.warn(JSON.stringify(logObject));
  } else {
    console.log(JSON.stringify(logObject));
  }
}

export const logger = {
  info: (context: string, message: string, data?: Record<string, unknown>) =>
    logEvent("info", { context, message, data }),
  warn: (context: string, message: string, data?: Record<string, unknown>) =>
    logEvent("warn", { context, message, data }),
  error: (context: string, message: string, error?: unknown, data?: Record<string, unknown>) =>
    logEvent("error", { context, message, error, data }),
};
