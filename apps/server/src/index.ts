import Fastify from "fastify";
import { replayRoutes } from "./routes/replay";
import { healthRoutes } from "./routes/health";
import { sessionRoutes } from "./routes/session";
import { aiRoutes } from "./routes/ai";
import { config, assertValidConfig } from "./config";
import { SessionStore } from "./session-store";

// Fail fast on startup if any required config values are missing or invalid.
assertValidConfig(config);

const server = Fastify({ logger: true });

// ---------------------------------------------------------------------------
// Bootstrap the session store and attach it as a decorator so every route
// plugin can access the same Redis-backed store instance.
// ---------------------------------------------------------------------------
const sessionStore = new SessionStore(config.redisUrl);

server.decorate("sessionStore", sessionStore);

// Ensure the Redis connection is live before accepting traffic, and close it
// cleanly when the process shuts down.
server.addHook("onReady", async () => {
  await sessionStore.connect();
  server.log.info("Session store connected to Redis");
});

server.addHook("onClose", async () => {
  await sessionStore.disconnect();
  server.log.info("Session store disconnected from Redis");
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
server.register(healthRoutes);
server.register(replayRoutes, { prefix: "/api" });
server.register(sessionRoutes, { prefix: "/api" });
server.register(aiRoutes, { prefix: "/api" });

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
server.listen({ port: config.port, host: "0.0.0.0" }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
async function shutdown(signal: string) {
  server.log.info(`Received ${signal}, shutting down gracefully…`);
  const timer = setTimeout(() => {
    server.log.error("Graceful shutdown timed out, forcing exit");
    process.exit(1);
  }, config.gracefulShutdownTimeoutMs);
  timer.unref();

  try {
    await server.close();
    server.log.info("Server closed");
    process.exit(0);
  } catch (closeErr) {
    server.log.error(closeErr, "Error during server close");
    process.exit(1);
  }
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
