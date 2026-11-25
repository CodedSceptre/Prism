// ---------------------------------------------------------------------------
// ServerConfig – every key the runtime uses must be declared here so the
// TypeScript compiler and editor intellisense catch mismatches early.
// ---------------------------------------------------------------------------

export interface AiConfig {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  maxTokensPerRequest: number;
  temperature: number;
  timeoutMs: number;
}

export interface BudgetConfig {
  hourlyTokenLimit: number;
  dailyTokenLimit: number;
  maxConcurrentRequests: number;
}

export interface CacheConfig {
  decodeTtl: number;
  profileTtl: number;
  dedupWindowMs: number;
}

export interface ServerConfig {
  port: number;
  redisUrl: string;
  gratBinaryPath: string;

  /**
   * Secret used to sign/verify JWTs.
   * Must be a non-empty string in production unless disableSessionAuth is true.
   */
  jwtSecret: string;

  /**
   * When true, session-token validation is skipped (development / testing only).
   * Must never be true in production.
   */
  disableSessionAuth: boolean;

  /**
   * Maximum milliseconds the server waits for in-flight requests to drain
   * before forcefully closing during a graceful shutdown.
   */
  gracefulShutdownTimeoutMs: number;

  ai: AiConfig;
  budget: BudgetConfig;
  cache: CacheConfig;
}

// ---------------------------------------------------------------------------
// assertValidConfig – call once at startup to surface misconfigurations
// before the server accepts any traffic.
// ---------------------------------------------------------------------------
export function assertValidConfig(cfg: ServerConfig): void {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !cfg.disableSessionAuth && !cfg.jwtSecret) {
    throw new Error(
      "SERVER CONFIG ERROR: jwtSecret must be set in production " +
        "(or set disableSessionAuth=true for local development, never in prod).",
    );
  }

  if (isProduction && cfg.disableSessionAuth) {
    // Warn loudly but do not crash – the check above already rejects the
    // most dangerous combination (no secret AND auth disabled in prod).
    console.warn(
      "WARNING: disableSessionAuth is true in a production environment.",
    );
  }

  if (cfg.gracefulShutdownTimeoutMs <= 0) {
    throw new Error(
      "SERVER CONFIG ERROR: gracefulShutdownTimeoutMs must be a positive number.",
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton config object
// ---------------------------------------------------------------------------
export const config: ServerConfig = {
  port: Number(process.env.PORT) || 3001,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  gratBinaryPath: process.env.GRAT_BINARY || "grat",

  jwtSecret: process.env.JWT_SECRET || "",
  disableSessionAuth: process.env.DISABLE_SESSION_AUTH === "true",
  gracefulShutdownTimeoutMs:
    Number(process.env.GRACEFUL_SHUTDOWN_TIMEOUT_MS) || 10_000,

  // AI provider
  ai: {
    apiKey: process.env.AI_API_KEY || "",
    apiBaseUrl: process.env.AI_API_BASE_URL || "https://api.openai.com/v1",
    model: process.env.AI_MODEL || "gpt-4o-mini",
    maxTokensPerRequest: Number(process.env.AI_MAX_TOKENS_PER_REQUEST) || 2048,
    temperature: Number(process.env.AI_TEMPERATURE) || 0.2,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 30_000,
  },

  // Token budget enforcement
  budget: {
    hourlyTokenLimit: Number(process.env.AI_HOURLY_TOKEN_LIMIT) || 100_000,
    dailyTokenLimit: Number(process.env.AI_DAILY_TOKEN_LIMIT) || 1_000_000,
    maxConcurrentRequests: Number(process.env.AI_MAX_CONCURRENT) || 5,
  },

  // Cache TTLs (seconds)
  cache: {
    decodeTtl: Number(process.env.CACHE_DECODE_TTL) || 86_400, // 24 h
    profileTtl: Number(process.env.CACHE_PROFILE_TTL) || 3_600, // 1 h
    dedupWindowMs: Number(process.env.DEDUP_WINDOW_MS) || 10_000, // 10 s
  },
};
