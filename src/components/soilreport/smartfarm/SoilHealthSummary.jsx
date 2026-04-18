import React from "react";
import { motion } from "framer-motion";
import { Activity, Leaf, Mountain, Droplets } from "lucide-react";

export default function SoilHealthSummary({
  healthScore,
  nitrogenLabel,
  fertilityLabel,
  moistureLabel,
}) {
  const cards = [
    {
      title: "Soil Health Score",
      value: `${healthScore ?? "—"}${typeof healthScore === "number" ? "/100" : ""}`,
      sub: "Composite from satellite signals",
      icon: Activity,
      tint: "from-emerald-500/10 to-emerald-600/5",
    },
    {
      title: "Nitrogen Level",
      value: nitrogenLabel || "—",
      sub: "Proxy from canopy / N index",
      icon: Leaf,
      tint: "from-lime-500/10 to-lime-600/5",
    },
    {
      title: "Soil Fertility",
      value: fertilityLabel || "—",
      sub: "SOC & vegetation context",
      icon: Mountain,
      tint: "from-amber-500/10 to-amber-600/5",
    },
    {
      title: "Moisture Status",
      value: moistureLabel || "—",
      sub: "NDMI / SMI synthesis",
      icon: Droplets,
      tint: "from-sky-500/10 to-sky-600/5",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3"
    >
      {cards.map(({ title, value, sub, icon: Icon, tint }) => (
        <div
          key={title}
          className={`rounded-[12px] border border-gray-100 bg-white shadow-[0_4px_20px_rgba(13,107,69,0.07)] p-4 relative overflow-hidden`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${tint} pointer-events-none`}
          />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-[#0D6B45]">
                {title}
              </span>
              <Icon className="w-5 h-5 text-[#0D6B45]/80" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </div>
        </div>
      ))}
    </motion.section>
  );
}
