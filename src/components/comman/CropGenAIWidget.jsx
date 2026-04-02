import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleMore, Sparkles } from "lucide-react";
import CropGenAiChat from "../cropgenai/CropGenAiChat";

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

    if (isOpen && window.innerWidth < 640) {
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
              aria-label="Close CropGen AI overlay"
              className="fixed inset-0 z-[9997] bg-[#09110d]/55 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-x-3 bottom-3 z-[9998] h-[min(82vh,720px)] sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[min(480px,calc(100vw-3rem))]"
            >
              <CropGenAiChat variant="widget" onClose={() => setIsOpen(false)} />
            </motion.div>
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
        title="CropGen AI — Ask about your farm"
        style={{
          backgroundColor: fabExpanded ? "#22362b" : "#1b2d24",
          color: "#f5fbf7",
        }}
        className={`fixed bottom-5 right-5 z-[9996] flex items-center overflow-hidden rounded-full border border-white/15 text-left shadow-[0_18px_40px_-16px_rgba(0,0,0,0.55)] ring-1 ring-[#86d72f]/20 will-change-[max-width] transition-[max-width,gap,padding,background-color] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#86d72f]/50 sm:bottom-6 sm:right-6 ${
          fabExpanded
            ? "max-w-[min(20rem,calc(100vw-2.5rem))] gap-3 px-4 py-3"
            : "max-w-[4.25rem] gap-0 py-2.5 pl-2.5 pr-2.5"
        }`}
        aria-expanded={fabExpanded}
        aria-label="Open CropGen AI"
      >
        <span className="relative inline-flex h-11 w-11 shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br from-[#9fe04a] to-[#5bb64f] text-[#102015] shadow-[0_10px_24px_-10px_rgba(159,224,74,0.8)] ring-2 ring-[#86d72f]/25 [&_svg]:shrink-0">
          <Sparkles className="h-5 w-5" strokeWidth={2.1} />
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#14301f] ring-2 ring-[#1b2d24]">
            <MessageCircleMore className="h-2.5 w-2.5 text-[#dff7c6]" />
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
          <span className="block whitespace-nowrap text-sm font-semibold leading-none !text-[#f8faf9]">
            CropGen AI
          </span>
          <span className="mt-1 block whitespace-nowrap text-xs !text-[#c4e0d4]">
            Ask about your farm
          </span>
          <span className="mt-1.5 block max-w-[14rem] text-[11px] leading-snug !text-[#b5cfc4]">
            {isLoggedIn
              ? "Personalised advice for your farms — pests, irrigation, yield."
              : "Crops, soil, pests, irrigation & weather — general guidance."}
          </span>
        </motion.span>
      </motion.button>
    </>
  );
};

export default CropGenAIWidget;
