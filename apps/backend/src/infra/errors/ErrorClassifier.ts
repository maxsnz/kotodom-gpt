export enum ErrorType {
  FATAL = "fatal",
  RETRYABLE = "retryable",
  TERMINAL = "terminal",
}

export class TerminalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TerminalError";
  }
}

export function hasStatusCode(
  error: unknown
): error is { statusCode?: number; status?: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    ("statusCode" in error || "status" in error)
  );
}

export function classifyError(error: unknown): ErrorType {
  const status =
    hasStatusCode(error) && typeof error.statusCode === "number"
      ? error.statusCode
      : hasStatusCode(error) && typeof error.status === "number"
      ? error.status
      : undefined;

  if (status === 401 || status === 403) {
    return ErrorType.FATAL;
  }

  if (status === 429 || (status !== undefined && status >= 500)) {
    return ErrorType.RETRYABLE;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("timeout") ||
      message.includes("etimedout") ||
      message.includes("econnreset") ||
      message.includes("rate limit")
    ) {
      return ErrorType.RETRYABLE;
    }

    if (
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("invalid token")
    ) {
      return ErrorType.FATAL;
    }
  }

  return ErrorType.TERMINAL;
}

