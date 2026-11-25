import { WebSocketServer, WebSocket } from "ws";

/** Interval between server-initiated pings (ms). */
const PING_INTERVAL_MS = 30_000;

/**
 * Number of consecutive missed pings before a connection is terminated.
 * With a 30 s interval, 3 missed pings ≈ 90 s of silence.
 */
const MAX_MISSED_PINGS = 3;

export interface TraceStreamMessage {
  type:
    | "trace_started"
    | "trace_node"
    | "resource_update"
    | "state_diff_entry"
    | "trace_completed"
    | "trace_error";
  trace_id?: string;
  [key: string]: any;
}

export interface AuthenticatedWebSocket extends WebSocket {
  /** True while we are waiting for the pong that answers the last ping. */
  isAlive: boolean;
  /** How many consecutive pings have gone unanswered. */
  missedPings: number;
}

export function createTraceStream(port: number) {
  const wss = new WebSocketServer({ port });

  // ------------------------------------------------------------------
  // Keepalive interval – ping every connected client every 30 s.
  // Clients that exceed MAX_MISSED_PINGS without responding are
  // terminated so zombie sockets do not accumulate under proxies or
  // load-balancers with idle-connection timeouts.
  // ------------------------------------------------------------------
  const keepalive = setInterval(() => {
    wss.clients.forEach((ws) => {
      const socket = ws as AuthenticatedWebSocket;

      if (!socket.isAlive) {
        socket.missedPings += 1;
        if (socket.missedPings >= MAX_MISSED_PINGS) {
          console.warn(
            `Terminating stale WebSocket client after ${socket.missedPings} missed pings`,
          );
          socket.terminate();
          return;
        }
      }

      // Mark as not-alive until the pong arrives, then send the ping.
      socket.isAlive = false;
      socket.ping();
    });
  }, PING_INTERVAL_MS);

  // Clear the interval when the server closes so the Node.js event
  // loop is not kept alive unnecessarily (e.g. in tests).
  wss.on("close", () => {
    clearInterval(keepalive);
  });

  wss.on("connection", (ws: WebSocket) => {
    const socket = ws as AuthenticatedWebSocket;

    // Initialise keepalive state for this connection.
    socket.isAlive = true;
    socket.missedPings = 0;

    // Reset the liveness flag on every pong received.
    socket.on("pong", () => {
      socket.isAlive = true;
      socket.missedPings = 0;
    });

    console.log("New trace stream client connected");

    socket.on("message", (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "subscribe" && message.tx_hash) {
          console.log(`Client subscribed to trace: ${message.tx_hash}`);

          socket.send(
            JSON.stringify({
              type: "subscribed",
              tx_hash: message.tx_hash,
            }),
          );
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    });

    socket.on("close", () => {
      console.log("Trace stream client disconnected");
    });

    socket.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });

  console.log(`Trace stream WebSocket server listening on port ${port}`);
  return wss;
}
