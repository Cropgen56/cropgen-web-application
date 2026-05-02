import React from "react";
import { motion } from "framer-motion";
import { Sprout, LandPlot } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.08,
      type: "spring",
      damping: 22,
      stiffness: 300,
    },
  }),
};

/**
 * First step on Add Field: full viewport, land status only (no map / form).
 * User must pick Crop in field or Barren land to continue.
 */
const LandStatusGate = ({ onConfirm }) => {
  return (
    <div
      className="fixed inset-0 z-[10050] flex min-h-[100dvh] flex-col items-center justify-center overflow-y-auto bg-gradient-to-b from-ember-sidebar via-ember-sidebar-hover to-ember-chat-dark px-4 py-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="land-gate-title"
      aria-describedby="land-gate-desc"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-ember-accent/12 blur-3xl" />
        <div className="absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            Add field
          </p>
          <h1
            id="land-gate-title"
            className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Land status
          </h1>
          <p
            id="land-gate-desc"
            className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base"
          >
            Choose one option first — then the map and crop details will open.
          </p>
        </motion.div>

        <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          <motion.button
            type="button"
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            onClick={() => onConfirm("crop")}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-br from-ember-sidebar via-ember-surface-muted to-ember-sidebar-hover p-5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.28)] transition-shadow hover:border-white/35 hover:shadow-[0_24px_60px_rgba(52,78,65,0.4)] sm:p-6"
          >
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl group-hover:bg-white/15"
              aria-hidden
            />
            <div className="relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
              <Sprout
                className="text-white"
                size={26}
                strokeWidth={1.85}
                aria-hidden
              />
            </div>
            <span className="relative block text-left text-base font-semibold text-white sm:text-lg">
              Crop in field
            </span>
            <span className="relative mt-2 block text-left text-xs leading-snug text-white/85 sm:text-sm">
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
            className="group relative overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-br from-ember-surface-muted via-ember-sidebar to-ember-chat-dark p-5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.28)] transition-shadow hover:border-white/35 hover:shadow-[0_24px_60px_rgba(52,78,65,0.35)] sm:p-6"
          >
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl group-hover:bg-white/15"
              aria-hidden
            />
            <div className="relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
              <LandPlot
                className="text-white"
                size={26}
                strokeWidth={1.85}
                aria-hidden
              />
            </div>
            <span className="relative block text-left text-base font-semibold text-white sm:text-lg">
              Barren land
            </span>
            <span className="relative mt-2 block text-left text-xs leading-snug text-white/85 sm:text-sm">
              No standing crop — planned crop & expected sowing
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default LandStatusGate;
