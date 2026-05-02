import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Send,
  Sparkles,
  RotateCcw,
  Wifi,
  WifiOff,
  User,
  Globe,
  X,
  Bot,
} from "lucide-react";
import { useCropGenAiChat } from "../../hooks/useCropGenAiChat";

/** Display numbers before "acre(s)" with 2 decimal places (matches mobile). */
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

function FormattedMessage({ text, variant }) {
  const t = formatAreaDecimalsForDisplay(String(text ?? ""));
  const parts = t.split(/(\*\*[^*]+\*\*)/g);
  const isUser = variant === "user";
  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, index) => {
        const isBold = /^\*\*[^*]+\*\*$/.test(part);
        const clean = isBold ? part.slice(2, -2) : part;
        if (isBold) {
          return (
            <strong
              key={`b-${index}`}
              className={isUser ? "font-bold text-white" : "font-bold text-ember-text"}
            >
              {clean}
            </strong>
          );
        }
        return <span key={`t-${index}`}>{clean}</span>;
      })}
    </span>
  );
}

export default function CropGenAiChat({ variant = "page", onClose = null }) {
  const userName = useSelector((state) => {
    const u = state.auth?.user || state.auth?.userDetails;
    return [u?.firstName, u?.lastName].filter(Boolean).join(" ") || "";
  });

  const {
    messages,
    status,
    error,
    awaitingReply,
    send,
    resetConversation,
    agentUrl,
    mode,
    fields,
    selectedFarmId,
    setActiveFarm,
  } = useCropGenAiChat();

  const isLoggedIn = mode === "app";
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const isWidget = variant === "widget";

  const showFarmChips = isLoggedIn && fields?.length > 1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, awaitingReply]);

  const connected = status === "connected";
  const onSubmit = (e) => {
    e.preventDefault();
    send(input);
    setInput("");
  };

  const showConnecting =
    status === "connecting" && !error && messages.length === 0;

  return (
    <div
      className={`relative z-[1] flex w-full flex-col font-poppins ${
        isWidget
          ? "h-full max-h-full px-0 py-0"
          : "mx-auto h-[100dvh] max-h-[100dvh] max-w-3xl px-3 py-4 sm:px-5 sm:py-6"
      }`}
    >
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.4rem] border border-ember-border bg-white shadow-[0_24px_80px_-28px_rgba(0,0,0,0.15)] sm:rounded-[1.75rem] ${
          isWidget ? "h-full" : ""
        }`}
      >
        {/* Header — dashboard ember green */}
        <header
          className={`shrink-0 bg-ember-sidebar text-white ${
            isWidget ? "px-4 pb-3 pt-4 sm:px-5" : "px-4 pb-4 pt-5 sm:px-6 sm:pt-6"
          }`}
        >
          {isWidget ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                    <Sparkles
                      className="h-5 w-5 text-white"
                      strokeWidth={1.75}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-ember-sidebar ring-2 ring-ember-sidebar">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-ember-accent shadow-[0_0_6px_rgba(140,198,63,0.85)]" : "bg-amber-300"}`}
                      />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="truncate whitespace-nowrap text-xl font-semibold tracking-tight text-white">
                        CropGen AI
                      </h1>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/90">
                        {isLoggedIn ? (
                          <>
                            <User className="h-3 w-3" />
                            {userName || "My Farm"}
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3" />
                            General
                          </>
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-white/85">
                      {isLoggedIn
                        ? "Personalised farm advice, crop insights, and quick recommendations."
                        : "Ask about crops, pests, irrigation, and weather."}
                    </p>
                  </div>
                </div>
                {onClose ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="Close CropGen AI"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                    connected
                      ? "bg-white/15 text-white ring-1 ring-white/30"
                      : "bg-black/20 text-amber-100 ring-1 ring-amber-400/40"
                  }`}
                >
                  {connected ? (
                    <Wifi className="h-3.5 w-3.5" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5" />
                  )}
                  {connected
                    ? "Connected"
                    : status === "connecting"
                      ? "Connecting…"
                      : "Offline"}
                </span>
                <button
                  type="button"
                  onClick={resetConversation}
                  disabled={!connected}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New chat
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3.5">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <Sparkles
                    className="h-6 w-6 text-white"
                    strokeWidth={1.75}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-ember-sidebar ring-2 ring-ember-sidebar">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-ember-accent shadow-[0_0_6px_rgba(140,198,63,0.85)]" : "bg-amber-300"}`}
                    />
                  </span>
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[1.35rem] font-semibold tracking-tight text-white sm:text-2xl">
                      CropGen AI
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-white/90">
                      {isLoggedIn ? (
                        <>
                          <User className="h-3 w-3" /> {userName || "My Farm"}
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3" /> General
                        </>
                      )}
                    </span>
                  </div>
                  <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-white/85 sm:text-sm">
                    {isLoggedIn
                      ? "Personalised advice for your farms — ask about pests, irrigation, growth, yield."
                      : "Guidance on crops, soil, and weather — not a replacement for your agronomist on critical calls."}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                    connected
                      ? "bg-white/15 text-white ring-1 ring-white/30"
                      : "bg-black/20 text-amber-100 ring-1 ring-amber-400/40"
                  }`}
                >
                  {connected ? (
                    <Wifi className="h-3.5 w-3.5" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5" />
                  )}
                  {connected
                    ? "Connected"
                    : status === "connecting"
                      ? "Connecting…"
                      : "Offline"}
                </span>
                <button
                  type="button"
                  onClick={resetConversation}
                  disabled={!connected}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New chat
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Farm chips — mobile CropgenBotScreen */}
        {showFarmChips && (
          <div className="shrink-0 border-b border-ember-border bg-ember-card px-3 py-2 sm:px-4">
            <p className="mb-2 text-xs font-semibold text-ember-primary">
              Discussing farm
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setActiveFarm("__all__")}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
                  selectedFarmId === "__all__"
                    ? "border-ember-sidebar bg-ember-sidebar/10 font-bold text-ember-primary"
                    : "border-ember-border bg-white text-ember-text"
                }`}
              >
                All farms
              </button>
              {fields.map((f) => {
                const id = String(f._id);
                const label =
                  f.fieldName || f.farmName || f.cropName || id;
                const sel = selectedFarmId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveFarm(id)}
                    className={`max-w-[200px] shrink-0 truncate rounded-full border px-3.5 py-2 text-[13px] font-medium transition ${
                      sel
                        ? "border-ember-sidebar bg-ember-sidebar/10 font-bold text-ember-primary"
                        : "border-ember-border bg-white text-ember-text"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div
            className="mx-4 mt-3 shrink-0 rounded-xl border border-amber-400/30 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:mx-6"
            role="alert"
          >
            <p className="font-medium text-amber-900">Connection issue</p>
            <p className="mt-1 text-amber-900/95">{error}</p>
            <p className="mt-2 text-xs text-amber-800/80">
              Agent:{" "}
              <code className="rounded-md bg-black/10 px-1.5 py-0.5 font-mono text-[11px]">
                {agentUrl}
              </code>
            </p>
          </div>
        )}

        {/* Chat body — light panel like mobile */}
        <div
          ref={scrollRef}
          className={`cropgen-ai-scroll min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-ember-card ${
            isWidget ? "px-3 py-3 sm:px-4" : "px-3 py-4 sm:px-5"
          }`}
          style={{
            backgroundImage:
              "radial-gradient(circle at 20px 20px, rgba(52,78,65,0.05) 1px, transparent 0)",
          }}
        >
          {showConnecting && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="relative">
                <div className="h-8 w-8 animate-pulse rounded-full bg-ember-sidebar/20" />
                <div className="absolute inset-0 animate-ping rounded-full bg-ember-sidebar/15" />
              </div>
              <p className="text-sm text-ember-text-secondary">
                Connecting to CropGen AI…
              </p>
            </div>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className={`flex items-end gap-2 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ember-border bg-white">
                  <Bot className="h-5 w-5 text-ember-sidebar" strokeWidth={2} />
                </div>
              )}
              {m.role === "assistant" ? (
                <div className="max-w-[min(100%,74vw)] sm:max-w-[min(100%,28rem)]">
                  <div
                    className={`rounded-xl border border-ember-border bg-white px-3 py-2.5 text-[13px] leading-relaxed text-ember-text shadow-[0_2px_4px_rgba(0,0,0,0.08)] ${
                      m.kind === "farm_context"
                        ? "border-ember-sidebar/30 bg-ember-card"
                        : "rounded-tl-none"
                    }`}
                  >
                    <FormattedMessage text={m.text} variant="bot" />
                  </div>
                </div>
              ) : (
                <div className="max-w-[min(100%,74vw)] rounded-xl rounded-tr-none bg-ember-sidebar px-3 py-2.5 text-[13px] leading-relaxed text-white shadow-[0_4px_4px_rgba(0,0,0,0.13)] sm:max-w-[min(100%,28rem)]">
                  <FormattedMessage text={m.text} variant="user" />
                </div>
              )}
            </motion.div>
          ))}

          {awaitingReply && (
            <div className="flex items-end gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ember-border bg-white">
                <Bot className="h-5 w-5 text-ember-sidebar" strokeWidth={2} />
              </div>
              <div className="flex h-6 items-end gap-1.5 px-1">
                <span className="cropgen-typing-dot h-2 w-2 rounded-full bg-ember-sidebar" />
                <span className="cropgen-typing-dot cropgen-typing-dot-d1 h-2 w-2 rounded-full bg-ember-sidebar" />
                <span className="cropgen-typing-dot cropgen-typing-dot-d2 h-2 w-2 rounded-full bg-ember-sidebar" />
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-px shrink-0" />
        </div>

        {/* Composer — mobile-style input row */}
        <form
          onSubmit={onSubmit}
          className="shrink-0 border-t border-ember-border bg-white px-3 py-2.5 sm:px-4 sm:py-3"
        >
          <div className="flex items-center gap-2">
            <div className="relative min-h-[40px] flex-1">
              <textarea
                id="cropgen-ai-input"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
                placeholder="Type your message…"
                disabled={!connected || awaitingReply}
                className="min-h-[40px] w-full resize-none rounded-full border border-ember-sidebar bg-white py-2.5 pl-4 pr-4 text-sm text-ember-text placeholder:text-ember-text-secondary/70 focus:border-ember-sidebar focus:outline-none focus:ring-2 focus:ring-ember-sidebar/20 disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={!connected || awaitingReply || !input.trim()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember-sidebar text-white shadow-md transition hover:bg-ember-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-ember-text-secondary">
            Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>

      <style>{`
        .cropgen-ai-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(52, 78, 65, 0.35) rgba(248, 251, 250, 0.95);
        }
        .cropgen-ai-scroll::-webkit-scrollbar {
          width: 7px;
        }
        .cropgen-ai-scroll::-webkit-scrollbar-track {
          background: rgba(248, 251, 250, 0.95);
          border-radius: 8px;
        }
        .cropgen-ai-scroll::-webkit-scrollbar-thumb {
          background: rgba(52, 78, 65, 0.35);
          border-radius: 8px;
        }
        @keyframes cropgen-typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .cropgen-typing-dot {
          animation: cropgen-typing-bounce 0.9s ease-in-out infinite;
        }
        .cropgen-typing-dot-d1 { animation-delay: 0.15s; }
        .cropgen-typing-dot-d2 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}
