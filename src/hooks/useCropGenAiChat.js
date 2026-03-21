import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const nextId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * cropgen-website chatbot uses `NEXT_PUBLIC_AGENT` + path `/v3/socket.io` (see ChatWindow.jsx).
 * This app uses CRA vars — set REACT_APP_CROPGEN_AGENT_URL to the same origin as NEXT_PUBLIC_AGENT.
 * Production default matches other services on server.cropgenapp.com.
 */
const AGENT_URL =
  process.env.REACT_APP_CROPGEN_AGENT_URL ||
  process.env.REACT_APP_AGENT_URL ||
  "https://server.cropgenapp.com";
const SOCKET_PATH = "/v3/socket.io";

/** Skip onboarding: auto-send "3" (general crop advice) when server sends welcome or reset-only prompts. */
function shouldAutoRouteToGeneral(text) {
  const t = String(text ?? "").toLowerCase();
  return (
    (t.includes("welcome") && t.includes("who you are")) ||
    t.includes("conversation reset") ||
    t.includes("let's start fresh")
  );
}

/** Same intro is sometimes sent twice (socket + model echo) — skip if already shown. */
const INTRO_MARKER = "satellite-based crop monitoring platform";

function shouldSkipDuplicateAssistant(text, existing) {
  const t = String(text ?? "");
  if (!t) return true;
  if (existing.some((x) => x.role === "assistant" && x.text === t)) {
    return true;
  }
  if (!t.toLowerCase().includes(INTRO_MARKER)) return false;
  return existing.some(
    (x) =>
      x.role === "assistant" &&
      x.text.toLowerCase().includes(INTRO_MARKER),
  );
}

/**
 * Socket.IO chat against cropgen-agent.
 * Automatically enters general crop-advice mode (option 3) without showing role selection.
 */
export function useCropGenAiChat() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState(null);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    setStatus("connecting");
    setError(null);

    /** Avoid emitting auto "3" twice if welcome/reset is duplicated (e.g. dev reconnect). */
    let autoSkipSent = false;

    const socket = io(AGENT_URL, {
      path: SOCKET_PATH,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      setError(null);
    });

    socket.on("connect_error", (err) => {
      setStatus("error");
      setError(
        err?.message ||
          "Cannot reach CropGen AI. Set REACT_APP_CROPGEN_AGENT_URL (same origin as website NEXT_PUBLIC_AGENT) or run cropgen-agent locally.",
      );
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        setStatus("disconnected");
      }
    });

    socket.on("ai_response", (msg) => {
      const text = String(msg ?? "");

      if (shouldAutoRouteToGeneral(text)) {
        const t = text.toLowerCase();
        if (t.includes("conversation reset") || t.includes("let's start fresh")) {
          autoSkipSent = false;
        }
        setAwaitingReply(true);
        if (!autoSkipSent) {
          autoSkipSent = true;
          socket.emit("user_message", "3");
        }
        return;
      }

      setAwaitingReply(false);
      setMessages((m) => {
        if (shouldSkipDuplicateAssistant(text, m)) {
          return m;
        }
        return [...m, { id: nextId(), role: "assistant", text }];
      });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const send = useCallback((text) => {
    const t = String(text ?? "").trim();
    if (!t) return;
    const s = socketRef.current;
    if (!s?.connected) {
      setError("Not connected. Wait for the green status or refresh the page.");
      return;
    }
    setMessages((m) => [...m, { id: nextId(), role: "user", text: t }]);
    setAwaitingReply(true);
    s.emit("user_message", t);
  }, []);

  const resetConversation = useCallback(() => {
    const s = socketRef.current;
    if (s?.connected) {
      s.emit("reset_conversation");
    }
    setMessages([]);
    setAwaitingReply(true);
  }, []);

  return {
    messages,
    status,
    error,
    awaitingReply,
    send,
    resetConversation,
    agentUrl: AGENT_URL,
  };
}
