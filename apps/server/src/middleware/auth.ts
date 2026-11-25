import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * Extract a Bearer token from an Authorization header.
 * Returns null when the header is absent or malformed.
 */
export function extractBearer(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Fastify preHandler that rejects requests lacking a valid Authorization
 * header.  Routes that need full session validation should call
 * SessionStore.verifyToken after this guard passes.
 */
export async function requireBearer(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = extractBearer(request.headers.authorization);
  if (!token) {
    await reply.status(401).send({ error: "Missing Authorization header" });
  }
}
