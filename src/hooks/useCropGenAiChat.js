import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { getFarmFields } from "../redux/slices/farmSlice";

const nextId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const rawAgentUrl =
  process.env.REACT_APP_CROPGEN_AGENT_URL ||
  process.env.REACT_APP_AGENT_URL ||
  "https://server.cropgenapp.com";
/** Origin only — avoids double slashes when joining namespaces */
const AGENT_URL = rawAgentUrl.replace(/\/+$/, "");
const SOCKET_PATH =
  process.env.REACT_APP_SOCKET_IO_PATH?.replace(/\/+$/, "") || "/v3/socket.io";

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

/** Matches cropgen-server `set_active_farm` acks — one bubble, replace on update */
function isFarmContextAckMessage(text) {
  const t = String(text ?? "").trim();
  if (t.startsWith("Showing all your farms:")) return true;
  if (/^Now discussing .+\([^)]*,\s*[^)]*acre\)/i.test(t)) return true;
  if (
    t.includes("Add a farm from the dashboard for field-specific advice") &&
    t.includes("You can still ask general farming questions")
  ) {
    return true;
  }
  return false;
}

/**
 * Unified hook — auto-detects logged-in vs public visitor.
 * Logged-in users connect to /app namespace with JWT.
 * Visitors connect to /public namespace with auto-skip onboarding.
 */
export function useCropGenAiChat() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);
  const user = useSelector((state) => state.auth?.user);
  const userDetails = useSelector((state) => state.auth?.userDetails);
  const fields = useSelector((state) => state.farmfield?.fields) || [];

  const resolvedUserId = useMemo(() => {
    const u = user || userDetails;
    if (u?._id) return u._id;
    if (u?.id) return u.id;
    return null;
  }, [user, userDetails]);

  const isLoggedIn = !!token;
  const mode = isLoggedIn ? "app" : "public";

  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState(null);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState(null);

  const socketRef = useRef(null);
  const modeRef = useRef(mode);
  const farmSyncedRef = useRef(false);
  const selectedFarmIdRef = useRef(null);

  useEffect(() => {
    selectedFarmIdRef.current = selectedFarmId;
  }, [selectedFarmId]);

  useEffect(() => {
    if (!resolvedUserId || !token) return;
    dispatch(getFarmFields(resolvedUserId));
  }, [resolvedUserId, token, dispatch]);

  useEffect(() => {
    modeRef.current = mode;
    farmSyncedRef.current = false;
    setSelectedFarmId(null);
    setMessages([]);
    setStatus("connecting");
    setError(null);
    setAwaitingReply(false);

    let autoSkipSent = false;

    const socketOpts = {
      path: SOCKET_PATH,
      transports: ["polling", "websocket"],
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

      if (mode === "app" && isFarmContextAckMessage(text)) {
        setAwaitingReply(false);
        setMessages((prev) => {
          const rest = prev.filter((m) => m.kind !== "farm_context");
          return [
            ...rest,
            {
              id: nextId(),
              role: "assistant",
              text,
              kind: "farm_context",
            },
          ];
        });
        return;
      }

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
      farmSyncedRef.current = false;
    };
  }, [mode, token]);

  useEffect(() => {
    if (mode !== "app" || status !== "connected") return;
    if (!fields?.length) return;
    if (farmSyncedRef.current) return;
    farmSyncedRef.current = true;
    const firstId = fields[0]?._id;
    if (firstId) {
      const idStr = String(firstId);
      setSelectedFarmId(idStr);
      setAwaitingReply(true);
      socketRef.current?.emit("set_active_farm", idStr);
    }
  }, [mode, status, fields]);

  const setActiveFarm = useCallback((farmKey) => {
    const s = socketRef.current;
    if (!s?.connected) return;
    if (farmKey === selectedFarmId) return;
    setSelectedFarmId(farmKey);
    setAwaitingReply(true);
    const payload =
      farmKey === "__all__" || farmKey == null ? null : farmKey;
    s.emit("set_active_farm", payload);
  }, [selectedFarmId]);

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
    if (mode === "app" && fields?.length) {
      setTimeout(() => {
        const sock = socketRef.current;
        if (!sock?.connected || !fields?.length) return;
        const key = selectedFarmIdRef.current;
        const payload =
          key === "__all__" || key == null ? null : key;
        if (fields.length > 1) {
          sock.emit("set_active_farm", payload);
        } else {
          sock.emit("set_active_farm", String(fields[0]._id));
        }
      }, 450);
    }
  }, [mode, fields]);

  return {
    messages,
    status,
    error,
    awaitingReply,
    send,
    resetConversation,
    agentUrl: AGENT_URL,
    mode,
    fields,
    selectedFarmId,
    setActiveFarm,
  };
}
