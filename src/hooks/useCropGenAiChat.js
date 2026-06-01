import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
  AI_ASSISTANT_NAME,
  AUTH_EMAIL_CLIENT_BRAND,
} from "../config/brand";

const nextId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const SOCKET_PATH =
  process.env.REACT_APP_SOCKET_IO_PATH?.replace(/\/+$/, "") ||
  "/v3/socket.io";
const PRODUCTION_AGENT_URL = "https://server.cropgenapp.com";

function resolveAgentUrl() {
  const fromEnv = (
    process.env.REACT_APP_CROPGEN_AGENT_URL ||
    process.env.REACT_APP_AGENT_URL ||
    ""
  ).trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    return window.location.origin;
  }
  return PRODUCTION_AGENT_URL;
}

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
  /** null = all farms (default agent context) */
  const [activeFarmId, setActiveFarmId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [historyStatus, setHistoryStatus] = useState("idle");
  const socketRef = useRef(null);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
    setMessages([]);
    setChatHistory([]);
    setHistoryStatus("idle");
    setStatus("connecting");
    setError(null);
    setAwaitingReply(false);
    setActiveFarmId(null);

    let autoSkipSent = false;

    const agentUrl = resolveAgentUrl();

    const socketOpts = {
      path: SOCKET_PATH,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
      withCredentials: true,
      query: { clientBrand: AUTH_EMAIL_CLIENT_BRAND },
    };

    if (mode === "app") {
      socketOpts.auth = { token };
    }

    const namespace = mode === "app" ? "/app" : "/public";
    const socket = io(`${agentUrl}${namespace}`, socketOpts);
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      setError(null);
      if (mode === "app") setAwaitingReply(true);
    });

    socket.on("connect_error", (err) => {
      setStatus("error");
      const hint =
        process.env.NODE_ENV === "development" &&
        agentUrl.includes("localhost")
          ? " Check that cropgen-server is running on port 7070."
          : "";
      setError(
        (err?.message || `Cannot reach ${AI_ASSISTANT_NAME}.`) + hint,
      );
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") setStatus("disconnected");
    });

    socket.on("chat_history", (payload) => {
      const rows = payload?.conversations;
      if (Array.isArray(rows)) {
        setChatHistory(rows);
        setHistoryStatus("ready");
      }
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
    setActiveFarmId(null);
    setAwaitingReply(true);
  }, []);

  const setActiveFarm = useCallback(
    (fieldId) => {
      const s = socketRef.current;
      if (!s?.connected) {
        setError("Not connected. Wait for the green status or refresh the page.");
        return;
      }
      const next = fieldId ? String(fieldId) : null;
      if (next === activeFarmId) return;
      setActiveFarmId(next);
      setAwaitingReply(true);
      s.emit("set_active_farm", next);
    },
    [activeFarmId],
  );

  const loadChatHistory = useCallback(() => {
    const s = socketRef.current;
    if (!s?.connected || modeRef.current !== "app") {
      setHistoryStatus("idle");
      return;
    }
    setHistoryStatus("loading");
    s.emit("get_history");
  }, []);

  return {
    messages,
    status,
    error,
    awaitingReply,
    send,
    resetConversation,
    setActiveFarm,
    activeFarmId,
    chatHistory,
    historyStatus,
    loadChatHistory,
    agentUrl: resolveAgentUrl(),
    mode,
  };
}
