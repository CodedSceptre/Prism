import type { FastifyInstance } from "fastify";
import { getRedis } from "../redis/client";

export async function healthRoutes(app: FastifyInstance) {
  // ------------------------------------------------------------------
  // GET /v1/health/live
  // Liveness probe – returns 200 as long as the process is running.
  // Kubernetes uses this to decide whether to restart the container.
  // ------------------------------------------------------------------
  app.get("/v1/health/live", async (_request, reply) => {
    return reply.status(200).send({ status: "ok" });
  });

  // ------------------------------------------------------------------
  // GET /v1/health/ready
  // Readiness probe – pings Redis before confirming readiness.
  // Returns 503 when Redis is unreachable so the pod is removed from
  // the load-balancer pool rather than serving requests it cannot fulfil.
  // ------------------------------------------------------------------
  app.get("/v1/health/ready", async (_request, reply) => {
    try {
      await getRedis().ping();
      return reply.status(200).send({ status: "ok" });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return reply.status(503).send({ status: "unavailable", reason });
    }
  });

  // ------------------------------------------------------------------
  // GET /health  (backward-compatible alias)
  // ------------------------------------------------------------------
  app.get("/health", async () => ({ status: "ok", version: "0.1.0" }));
}
