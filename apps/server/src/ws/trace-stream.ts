import { WebSocketServer, WebSocket } from "ws";
import { SessionStore } from "../session-store";

/** Close code sent when a subscribe message fails authentication. */
const WS_POLICY_VIOLATION = 4001;

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
  isAlive: boolean;
  missedPings: number;
}

export function createTraceStream(port: number, sessionStore: SessionStore) {
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws: WebSocket) => {
    const socket = ws as AuthenticatedWebSocket;
    socket.isAlive = true;
    socket.missedPings = 0;

    console.log("New trace stream client connected");

    socket.on("pong", () => {
      socket.isAlive = true;
      socket.missedPings = 0;
    });

    socket.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "subscribe" && message.tx_hash) {
          const { session_id, token } = message;

          // Require a session_id and bearer token on every subscribe message.
          if (!session_id || !token) {
            socket.close(WS_POLICY_VIOLATION, "Authentication required");
            return;
          }

          // Validate the token against the SessionStore.
          const valid = await sessionStore.verifyToken(session_id, token);
          if (!valid) {
            socket.close(WS_POLICY_VIOLATION, "Invalid or expired session");
            return;
          }

          console.log(`Authenticated client subscribed to trace: ${message.tx_hash}`);

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
