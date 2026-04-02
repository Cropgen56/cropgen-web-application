import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const nextId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const AGENT_URL =
  process.env.REACT_APP_CROPGEN_AGENT_URL ||
  process.env.REACT_APP_AGENT_URL ||
  "https://server.cropgenapp.com";
const SOCKET_PATH = "/v3/socket.io";

function shouldAutoRouteToGeneral(text) {
  const t = String(text ?? "").toLowerCase();
  return (
    (t.includes("welcome") && t.includes("who you are")) ||
    t.includes("conversation reset") ||
    t.includes("let's start fresh")
  );
}

const INTRO_MARKER = "satellite-based crop monitoring platform";

function shouldSkipDuplicateAssistant(text, existing) {
  const t = String(text ?? "");
  if (!t) return true;
  if (existing.some((x) => x.role === "assistant" && x.text === t)) return true;
  if (!t.toLowerCase().includes(INTRO_MARKER)) return false;
  return existing.some(
    (x) => x.role === "assistant" && x.text.toLowerCase().includes(INTRO_MARKER),
  );
}

/**
 * Unified hook — auto-detects logged-in vs public visitor.
 * Logged-in users connect to /app namespace with JWT.
 * Visitors connect to /public namespace with auto-skip onboarding.
 */
export function useCropGenAiChat() {
  const token = useSelector((state) => state.auth?.token);
  const isLoggedIn = !!token;
  const mode = isLoggedIn ? "app" : "public";

  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState(null);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const socketRef = useRef(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
    setMessages([]);
    setStatus("connecting");
    setError(null);
    setAwaitingReply(false);

    let autoSkipSent = false;

    const socketOpts = {
      path: SOCKET_PATH,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
    };

    if (mode === "app") {
      socketOpts.auth = { token };
    }

    const namespace = mode === "app" ? "/app" : "/public";
    const socket = io(`${AGENT_URL}${namespace}`, socketOpts);
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      setError(null);
      if (mode === "app") setAwaitingReply(true);
    });

    socket.on("connect_error", (err) => {
      setStatus("error");
      setError(err?.message || "Cannot reach CropGen AI.");
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") setStatus("disconnected");
    });

    socket.on("ai_response", (msg) => {
      const text = String(msg ?? "");

      if (mode === "public" && shouldAutoRouteToGeneral(text)) {
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
        if (mode === "public" && shouldSkipDuplicateAssistant(text, m)) return m;
        if (m.some((x) => x.role === "assistant" && x.text === text)) return m;
        return [...m, { id: nextId(), role: "assistant", text }];
      });
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [mode, token]);

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
    if (s?.connected) s.emit("reset_conversation");
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
    mode,
  };
}
