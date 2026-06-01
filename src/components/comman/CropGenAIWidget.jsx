import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleMore, Sparkles } from "lucide-react";
import CropGenAiChat from "../cropgenai/CropGenAiChat";
import { AI_ASSISTANT_NAME } from "../../config/brand";

const CropGenAIWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const isLoggedIn = useSelector((state) => Boolean(state.auth?.token));

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const body = document.body;
    const previousOverflow = body.style.overflow;

    if (isOpen) {
      body.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              aria-label={`Close ${AI_ASSISTANT_NAME} panel`}
              className="fixed inset-0 z-[9997] bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-y-0 right-0 z-[9998] flex w-full max-w-[min(100%,440px)] flex-col border-l border-gray-200 bg-white shadow-[-8px_0_40px_rgba(0,0,0,0.12)]"
              role="dialog"
              aria-label={AI_ASSISTANT_NAME}
            >
              <CropGenAiChat variant="widget" onClose={() => setIsOpen(false)} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setFabExpanded(true)}
        onMouseLeave={() => setFabExpanded(false)}
        onFocus={() => setFabExpanded(true)}
        onBlur={() => setFabExpanded(false)}
        whileTap={{ scale: 0.96 }}
        title={`${AI_ASSISTANT_NAME} — Ask about your farm`}
        style={{
          backgroundColor: fabExpanded ? "#2B4035" : "#344E41",
          color: "#f5fbf7",
        }}
        className={`fixed bottom-5 right-5 z-[9996] flex items-center overflow-hidden border border-white/15 text-left shadow-[0_18px_40px_-16px_rgba(0,0,0,0.55)] ring-1 ring-ember-accent/20 will-change-[max-width] transition-[max-width,gap,padding,background-color,border-radius] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-accent/50 sm:bottom-6 sm:right-6 ${
          fabExpanded
            ? "max-w-[min(20rem,calc(100vw-2.5rem))] gap-3 rounded-full px-4 py-3"
            : "h-[4.25rem] w-[4.25rem] max-w-[4.25rem] shrink-0 justify-center rounded-full p-0"
        }`}
        aria-expanded={fabExpanded}
        aria-label={`Open ${AI_ASSISTANT_NAME}`}
      >
        <span className="relative inline-flex h-11 w-11 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-ember-light-lime to-ember-accent text-ember-chat-dark shadow-[0_10px_24px_-10px_rgba(140,198,63,0.8)] ring-2 ring-ember-accent/25 [&_svg]:shrink-0">
          <Sparkles className="h-5 w-5" strokeWidth={2.1} />
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-ember-sidebar ring-2 ring-[#344E41]">
            <MessageCircleMore className="h-2.5 w-2.5 text-ember-light-lime" />
          </span>
        </span>
        <motion.span
          aria-hidden={!fabExpanded}
          initial={false}
          animate={{
            opacity: fabExpanded ? 1 : 0,
            x: fabExpanded ? 0 : 4,
            maxWidth: fabExpanded ? 240 : 0,
          }}
          transition={{
            maxWidth: { duration: 0.36, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.2, delay: fabExpanded ? 0.07 : 0 },
            x: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
          }}
          className="pointer-events-none flex min-w-0 flex-col items-start overflow-hidden text-left text-[#f5fbf7]"
        >
          <span className="block whitespace-nowrap text-sm font-semibold leading-none text-[#f8faf9]">
            {AI_ASSISTANT_NAME}
          </span>
          <span className="mt-1 block whitespace-nowrap text-xs text-[#c4e0d4]">
            Ask about your farm
          </span>
          <span className="mt-1.5 block max-w-[14rem] text-[11px] leading-snug text-[#b5cfc4]">
            {isLoggedIn
              ? "Chat independently — pests, irrigation, yield, advisories."
              : "Crops, soil, pests, irrigation & weather."}
          </span>
        </motion.span>
      </motion.button>
    </>
  );
};

export default CropGenAIWidget;
