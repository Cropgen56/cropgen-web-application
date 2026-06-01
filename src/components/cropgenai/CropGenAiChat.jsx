import React, { useRef, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../../redux/slices/farmSlice";
import { motion } from "framer-motion";
import {
  Send,
  Sparkles,
  SquarePen,
  ArrowUpRight,
  ThumbsUp,
  ThumbsDown,
  PanelRightClose,
  History,
  Plus,
} from "lucide-react";
import { useCropGenAiChat } from "../../hooks/useCropGenAiChat";
import FarmContextPicker from "./FarmContextPicker";
import { AI_ASSISTANT_NAME, AI_ASSISTANT_SHORT } from "../../config/brand";

const BRAND = "#344E41";

function formatAreaDecimalsForDisplay(text) {
  if (typeof text !== "string") return text;
  return text.replace(
    /(\d+(?:\.\d+)?)\s+(acre|acres)\b/gi,
    (match, num, unit) => {
      const n = Number(num);
      if (!Number.isFinite(n)) return match;
      return `${n.toFixed(2)} ${unit}`;
    },
  );
}

function FormattedMessage({ text }) {
  const t = formatAreaDecimalsForDisplay(String(text ?? ""));
  const parts = t.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-800">
      {parts.map((part, index) => {
        const isBold = /^\*\*[^*]+\*\*$/.test(part);
        const clean = isBold ? part.slice(2, -2) : part;
        if (isBold) {
          return (
            <strong key={`b-${index}`} className="font-semibold text-gray-900">
              {clean}
            </strong>
          );
        }
        return <span key={`t-${index}`}>{clean}</span>;
      })}
    </span>
  );
}

function stripFarmListFromWelcome(text) {
  const t = String(text ?? "");
  return t
    .replace(/\s*I can see your farms?:\s*[^.]+\.\s*/i, " ")
    .replace(/\s*Use the farm buttons above[^.]*\.\s*/i, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function buildSuggestions({ isLoggedIn, activeFarmName, cropName }) {
  if (!isLoggedIn) {
    return [
      "What is NDVI and how can it help my farm?",
      "How do I plan irrigation during dry weeks?",
      "Common pest signs in rice and wheat crops",
      "When should I apply basal fertilizer?",
    ];
  }
  const farm = activeFarmName || "my farm";
  const crop = cropName ? ` for ${cropName}` : "";
  return [
    `What should I check on ${farm} this week?`,
    `How is crop health on ${farm}${crop}?`,
    "When should I irrigate based on recent weather?",
    "Explain NDVI and vegetation indices for my field",
    "What pests should I watch for this season?",
  ];
}

function IconButton({ children, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function AssistantAvatar() {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${BRAND} 0%, #2B4035 100%)`,
      }}
    >
      <Sparkles className="h-4 w-4" strokeWidth={2} />
    </span>
  );
}

export default function CropGenAiChat({ variant = "page", onClose = null }) {
  const dispatch = useDispatch();
  const userName = useSelector((state) => {
    const u = state.auth?.user || state.auth?.userDetails;
    return [u?.firstName, u?.lastName].filter(Boolean).join(" ") || "";
  });
  const userId = useSelector(
    (state) =>
      state.auth?.user?.id ||
      state.auth?.user?._id ||
      state.auth?.userDetails?._id,
  );
  const farms = useSelector((state) => state.farmfield?.fields) || [];

  const {
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
    mode,
  } = useCropGenAiChat();

  const isLoggedIn = mode === "app";
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn && userId) dispatch(getFarmFields(userId));
  }, [dispatch, isLoggedIn, userId]);

  const activeFarm = useMemo(() => {
    if (!activeFarmId) return null;
    return farms.find(
      (f) => (f._id?.toString?.() ?? String(f._id)) === activeFarmId,
    );
  }, [activeFarmId, farms]);

  const activeFarmName = activeFarm?.fieldName || activeFarm?.farmName || null;

  const connected = status === "connected";

  const suggestions = useMemo(
    () =>
      buildSuggestions({
        isLoggedIn,
        activeFarmName,
        cropName: activeFarm?.cropName,
      }),
    [isLoggedIn, activeFarmName, activeFarm?.cropName],
  );

  const showSuggestions =
    activeTab === "chat" &&
    connected &&
    !awaitingReply &&
    messages.filter((m) => m.role === "user").length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, awaitingReply, activeTab]);

  useEffect(() => {
    if (activeTab === "history" && isLoggedIn) {
      loadChatHistory();
    }
  }, [activeTab, isLoggedIn, loadChatHistory]);

  const onSubmit = (e) => {
    e?.preventDefault?.();
    if (!input.trim()) return;
    send(input);
    setInput("");
    setActiveTab("chat");
  };

  const handleSuggestion = (text) => {
    send(text);
    setActiveTab("chat");
  };

  const showConnecting =
    status === "connecting" && !error && messages.length === 0;

  const isWidget = variant === "widget";

  return (
    <div
      className={`flex h-full min-h-0 w-full flex-col bg-white font-poppins ${
        isWidget ? "" : "mx-auto max-w-3xl"
      }`}
    >
      <header className="shrink-0 border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                activeTab === "chat"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Chat
            </button>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  activeTab === "history"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                History
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-0.5">
            <IconButton
              label="New chat"
              onClick={resetConversation}
              disabled={!connected}
            >
              <SquarePen className="h-4 w-4" />
            </IconButton>
            {onClose ? (
              <IconButton label="Close assistant" onClick={onClose}>
                <PanelRightClose className="h-4 w-4" />
              </IconButton>
            ) : null}
          </div>
        </div>

        {!connected && status !== "connecting" ? (
          <p className="mt-2 text-xs text-amber-700">
            {error || "Offline — refresh or check your connection."}
          </p>
        ) : null}
      </header>

      {activeTab === "chat" && isLoggedIn && farms.length > 0 && connected ? (
        <FarmContextPicker
          farms={farms}
          activeFarmId={activeFarmId}
          onSelect={setActiveFarm}
          disabled={awaitingReply}
        />
      ) : null}

      {activeTab === "history" ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {historyStatus === "loading" ? (
            <p className="text-sm text-gray-500">Loading history…</p>
          ) : chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <History className="h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-700">
                No saved messages yet
              </p>
              <p className="text-xs text-gray-500">
                Your chats with {AI_ASSISTANT_SHORT} will appear here.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {chatHistory.map((row, i) => (
                <li
                  key={`${row.ts || i}-${row.sender}`}
                  className={`rounded-xl border px-3 py-2.5 text-sm ${
                    row.sender === "user"
                      ? "ml-6 border-gray-200 bg-gray-50 text-gray-800"
                      : "mr-4 border-ember-sidebar/15 bg-[#f4faf7] text-gray-800"
                  }`}
                >
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {row.sender === "user" ? "You" : AI_ASSISTANT_SHORT}
                    {row.ts ? ` · ${new Date(row.ts).toLocaleString()}` : ""}
                  </span>
                  {row.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {showConnecting ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200"
                  style={{ borderTopColor: BRAND }}
                />
                <p className="text-sm text-gray-500">
                  Connecting to {AI_ASSISTANT_NAME}…
                </p>
              </div>
            ) : null}

            {error && activeTab === "chat" ? (
              <div
                className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {messages.length === 0 && connected && !showConnecting ? (
              <div className="mb-6 flex gap-3">
                <AssistantAvatar />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {AI_ASSISTANT_SHORT}
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-gray-700">
                    {isLoggedIn
                      ? `Hi${userName ? ` ${userName.split(" ")[0]}` : ""}! Ask anything about your farms — pests, soil, irrigation, weather, or advisories.`
                      : `Hi! I'm ${AI_ASSISTANT_SHORT}. Ask about crops, soil, pests, irrigation, or weather.`}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="space-y-5">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={
                    m.role === "user" ? "flex justify-end" : "flex justify-start"
                  }
                >
                  {m.role === "assistant" ? (
                    <div className="max-w-[92%]">
                      <div className="mb-1.5 flex items-center gap-2">
                        <AssistantAvatar />
                        <span className="text-sm font-semibold text-gray-900">
                          {AI_ASSISTANT_SHORT}
                        </span>
                      </div>
                      <div className="pl-9">
                        <FormattedMessage
                          text={
                            isLoggedIn && farms.length > 0
                              ? stripFarmListFromWelcome(m.text)
                              : m.text
                          }
                        />
                        <div className="mt-2 flex gap-1">
                          <button
                            type="button"
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Helpful"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Not helpful"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-gray-100 px-4 py-2.5 text-gray-900">
                      <FormattedMessage text={m.text} />
                    </div>
                  )}
                </motion.div>
              ))}

              {awaitingReply ? (
                <div className="flex gap-3">
                  <AssistantAvatar />
                  <div className="flex items-center gap-2 pt-1 text-sm text-gray-500">
                    <span className="inline-flex gap-1">
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "120ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "240ms" }}
                      />
                    </span>
                    Thinking…
                  </div>
                </div>
              ) : null}
            </div>

            {showSuggestions ? (
              <div className="mt-8 border-t border-gray-100 pt-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Sparkles className="h-4 w-4" style={{ color: BRAND }} />
                  Suggestions
                </div>
                <ul className="space-y-1">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => handleSuggestion(s)}
                        className="group flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left text-[15px] text-gray-800 transition hover:bg-gray-50"
                      >
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-ember-sidebar" />
                        <span className="flex-1">{s}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div ref={bottomRef} className="h-1 shrink-0" />
          </div>

          <form
            onSubmit={onSubmit}
            className="shrink-0 border-t border-gray-100 bg-white px-4 py-3"
          >
            <div className="relative rounded-2xl border border-gray-900/80 bg-white shadow-sm focus-within:ring-2 focus-within:ring-ember-sidebar/20">
              <label className="sr-only" htmlFor="cropgen-ai-input">
                Message
              </label>
              <textarea
                id="cropgen-ai-input"
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
                placeholder={`Ask ${AI_ASSISTANT_SHORT} anything…`}
                disabled={!connected || awaitingReply}
                className="block w-full resize-none rounded-2xl border-0 bg-transparent px-4 pb-12 pt-3.5 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
              />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <button
                  type="button"
                  disabled
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-300"
                  aria-hidden
                  tabIndex={-1}
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={!connected || awaitingReply || !input.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND} 0%, #2B4035 100%)`,
                  }}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-gray-400">
              {AI_ASSISTANT_SHORT} can make mistakes. Double-check important farm
              decisions with your agronomist.
            </p>
          </form>
        </>
      )}
    </div>
  );
}
