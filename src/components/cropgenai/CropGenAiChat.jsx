import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Send,
  Sparkles,
  RotateCcw,
  Wifi,
  WifiOff,
  MessageCircle,
  User,
  Globe,
  X,
} from "lucide-react";
import { useCropGenAiChat } from "../../hooks/useCropGenAiChat";

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
  } = useCropGenAiChat();

  const isLoggedIn = mode === "app";
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const isWidget = variant === "widget";

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
      {/* Single glass panel — everything inside for focus */}
      <div
        className={`flex min-h-0 flex-1 flex-col overflow-hidden border border-white/[0.14] bg-[#16241c]/75 backdrop-blur-xl ${
          isWidget
            ? "h-full rounded-[1.4rem] shadow-[0_24px_80px_-28px_rgba(0,0,0,0.72)]"
            : "rounded-[1.75rem] shadow-[0_28px_90px_-24px_rgba(0,0,0,0.55)]"
        }`}
      >
        {/* Top bar */}
        <header
          className={`shrink-0 border-b border-white/[0.08] ${
            isWidget
              ? "px-4 pb-3 pt-4 sm:px-5"
              : "px-4 pb-4 pt-5 sm:px-6 sm:pt-6"
          }`}
        >
          {isWidget ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#86d72f]/25 to-[#5a7c6b]/40 shadow-inner ring-1 ring-white/15">
                    <Sparkles
                      className="h-5 w-5 text-[#e8f8c8]"
                      strokeWidth={1.75}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#344e41] ring-2 ring-[#16241c]">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-[#86d72f] shadow-[0_0_6px_#86d72f]" : "bg-amber-400"}`}
                      />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="truncate whitespace-nowrap text-xl font-semibold tracking-tight text-[#f8faf9]">
                        CropGen AI
                      </h1>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#c4e0d4]">
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
                    <p className="mt-1 text-sm leading-5 text-[#b5cfc4]">
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
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-[#eef4f0] transition hover:bg-white/10"
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
                      ? "bg-[#1c3228] text-[#b8f0c0] ring-1 ring-[#86d72f]/35"
                      : "bg-[#3a3228] text-[#fde68a] ring-1 ring-amber-500/30"
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
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-[#eef4f0] transition hover:bg-white/10 disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New chat
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-3.5">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#86d72f]/25 to-[#5a7c6b]/40 shadow-inner ring-1 ring-white/15">
                  <Sparkles
                    className="h-6 w-6 text-[#e8f8c8]"
                    strokeWidth={1.75}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#344e41] ring-2 ring-[#16241c]">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-[#86d72f] shadow-[0_0_6px_#86d72f]" : "bg-amber-400"}`}
                    />
                  </span>
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[1.35rem] font-semibold tracking-tight text-[#f8faf9] sm:text-2xl">
                      CropGen AI
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#c4e0d4]">
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
                  <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-[#b5cfc4] sm:text-sm">
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
                      ? "bg-[#1c3228] text-[#b8f0c0] ring-1 ring-[#86d72f]/35"
                      : "bg-[#3a3228] text-[#fde68a] ring-1 ring-amber-500/30"
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
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-[#eef4f0] transition hover:bg-white/10 disabled:opacity-40"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New chat
                </button>
              </div>
            </div>
          )}
        </header>

        {error && (
          <div
            className="mx-4 mt-3 shrink-0 rounded-xl border border-amber-400/30 bg-amber-950/35 px-4 py-3 text-sm text-amber-50 sm:mx-6"
            role="alert"
          >
            <p className="font-medium text-amber-100">Connection issue</p>
            <p className="mt-1 text-amber-50/95">{error}</p>
            <p className="mt-2 text-xs text-amber-200/80">
              Agent:{" "}
              <code className="rounded-md bg-black/35 px-1.5 py-0.5 font-mono text-[11px]">
                {agentUrl}
              </code>
            </p>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          className={`cropgen-ai-scroll min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain ${
            isWidget ? "px-4 py-4 sm:px-5" : "px-4 py-5 sm:px-6"
          }`}
        >
          {showConnecting && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="relative">
                <div className="h-8 w-8 animate-pulse rounded-full bg-[#5a7c6b]/50" />
                <div className="absolute inset-0 animate-ping rounded-full bg-[#86d72f]/20" />
              </div>
              <p className="text-sm text-[#a8c9b8]">
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
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" ? (
                <div className="flex max-w-[min(100%,34rem)] flex-col gap-1.5">
                  <div className="flex items-center gap-2 pl-1">
                    <MessageCircle className="h-3.5 w-3.5 text-[#86d72f]/90" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8eb39a]">
                      CropGen
                    </span>
                  </div>
                  <div className="rounded-2xl rounded-tl-md border border-[#d8e8df] bg-[#f8fbfa] px-[1.05rem] py-3 text-[0.9375rem] leading-[1.65] text-[#1a2e24] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)]">
                    <span className="whitespace-pre-wrap break-words">
                      {m.text}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="max-w-[min(100%,34rem)] rounded-2xl rounded-tr-md bg-gradient-to-br from-[#5a7c6b] to-[#4a6b5c] px-[1.05rem] py-3 text-[0.9375rem] leading-[1.65] text-[#fafcfa] shadow-[0_8px_28px_-6px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
                  <span className="whitespace-pre-wrap break-words">
                    {m.text}
                  </span>
                </div>
              )}
            </motion.div>
          ))}

          {awaitingReply && (
            <div className="flex justify-start">
              <div className="flex max-w-[min(100%,34rem)] flex-col gap-1.5">
                <div className="flex items-center gap-2 pl-1">
                  <MessageCircle className="h-3.5 w-3.5 text-[#86d72f]/90" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8eb39a]">
                    CropGen
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl rounded-tl-md border border-[#d8e8df]/80 bg-[#f0f5f2]/90 px-4 py-3 text-sm text-[#5a7c6b]">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5a7c6b]" />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5a7c6b]"
                      style={{ animationDelay: "0.12s" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5a7c6b]"
                      style={{ animationDelay: "0.24s" }}
                    />
                  </span>
                  <span className="text-[#4a6358]">Writing a reply…</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-px shrink-0" />
        </div>

        {/* Composer */}
        <form
          onSubmit={onSubmit}
          className={`shrink-0 border-t border-white/[0.08] bg-[#121c17]/90 ${
            isWidget ? "p-3" : "p-3 sm:p-4"
          }`}
        >
          <div className="flex items-end gap-2 rounded-2xl border border-[#5a7c6b]/30 bg-[#1e2e26]/95 p-2 pl-3 shadow-inner transition focus-within:border-[#86d72f]/40 focus-within:ring-2 focus-within:ring-[#86d72f]/15">
            <label className="sr-only" htmlFor="cropgen-ai-input">
              Message
            </label>
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
              placeholder="Ask about pests, soil, irrigation, weather…"
              disabled={!connected || awaitingReply}
              className="min-h-[48px] max-h-36 flex-1 resize-y border-0 bg-transparent py-2.5 text-[0.9375rem] leading-relaxed text-[#f4f6f4] placeholder:text-[#7a9a8a] focus:outline-none focus:ring-0 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!connected || awaitingReply || !input.trim()}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#9fe04a] to-[#6fb83a] text-[#142018] shadow-md transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:brightness-100"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-[#6d8a7c]">
            Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>

      <style>{`
        .cropgen-ai-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(90, 124, 107, 0.45) rgba(20, 30, 25, 0.5);
        }
        .cropgen-ai-scroll::-webkit-scrollbar {
          width: 7px;
        }
        .cropgen-ai-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 8px;
        }
        .cropgen-ai-scroll::-webkit-scrollbar-thumb {
          background: rgba(90, 124, 107, 0.45);
          border-radius: 8px;
        }
        .cropgen-ai-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(134, 215, 47, 0.35);
        }
      `}</style>
    </div>
  );
}
