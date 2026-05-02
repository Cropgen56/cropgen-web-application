import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, LandPlot } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.06 + i * 0.06,
      type: "spring",
      damping: 22,
      stiffness: 320,
    },
  }),
};

/**
 * Optional land status picker (e.g. from sidebar "Change"). When allowDismiss,
 * user can close without choosing and keep the current setting.
 */
const FieldStatusOverlay = ({
  open,
  allowDismiss = false,
  onDismiss,
  onConfirm,
}) => {
  useEffect(() => {
    if (!open || !allowDismiss) return;
    const onKey = (e) => {
      if (e.key === "Escape") onDismiss?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, allowDismiss, onDismiss]);

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Choose land status"
          aria-describedby="land-status-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9980] flex items-center justify-center p-4 sm:p-6 pointer-events-auto"
        >
          {allowDismiss ? (
            <button
              type="button"
              aria-label="Close and keep current land status"
              className="absolute inset-0 bg-ember-chat-dark/55 backdrop-blur-[2px]"
              onClick={onDismiss}
            />
          ) : (
            <div
              className="absolute inset-0 bg-ember-chat-dark/55 backdrop-blur-[2px]"
              aria-hidden
            />
          )}

          <div
            className="relative z-10 flex w-full max-w-xl flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              id="land-status-hint"
              className="text-center text-sm font-medium text-white/90 drop-shadow-sm sm:text-base px-2"
            >
              {allowDismiss
                ? "Optional — pick a land status or keep your current one"
                : "Select one option to continue"}
            </p>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <motion.button
                type="button"
                custom={0}
                variants={cardVariants}
                initial="hidden"
                animate="show"
                onClick={() => onConfirm("crop")}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-br from-ember-sidebar via-ember-surface-muted to-ember-sidebar-hover p-5 text-left shadow-[0_16px_48px_rgba(0,0,0,0.28)] transition-shadow hover:border-white/35 hover:shadow-[0_20px_56px_rgba(52,78,65,0.4)] sm:p-6"
              >
                <div
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl group-hover:bg-white/15"
                  aria-hidden
                />
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                  <Sprout
                    className="text-white"
                    size={26}
                    strokeWidth={1.85}
                    aria-hidden
                  />
                </div>
                <span className="relative block text-base font-semibold text-white sm:text-lg">
                  Crop in field
                </span>
                <span className="relative mt-2 block text-xs leading-snug text-white/85 sm:text-sm">
                  Already sown — actual sowing date
                </span>
              </motion.button>

              <motion.button
                type="button"
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate="show"
                onClick={() => onConfirm("barren")}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-br from-ember-surface-muted via-ember-sidebar to-ember-chat-dark p-5 text-left shadow-[0_16px_48px_rgba(0,0,0,0.28)] transition-shadow hover:border-white/35 hover:shadow-[0_20px_56px_rgba(52,78,65,0.35)] sm:p-6"
              >
                <div
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl group-hover:bg-white/15"
                  aria-hidden
                />
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                  <LandPlot
                    className="text-white"
                    size={26}
                    strokeWidth={1.85}
                    aria-hidden
                  />
                </div>
                <span className="relative block text-base font-semibold text-white sm:text-lg">
                  Barren land
                </span>
                <span className="relative mt-2 block text-xs leading-snug text-white/85 sm:text-sm">
                  No standing crop — planned crop & expected sowing
                </span>
              </motion.button>
            </div>

            {allowDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-xl border border-white/25 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Keep current selection
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FieldStatusOverlay;
