import React from "react";
import { motion } from "framer-motion";
import { FlaskConical, Droplets, Shovel } from "lucide-react";

export default function Recommendations({ fertilizer, irrigation, soil }) {
  const cards = [
    {
      title: "Fertilizer Advice",
      body: fertilizer,
      icon: FlaskConical,
      accent: "border-l-4 border-l-emerald-500",
    },
    {
      title: "Irrigation Advice",
      body: irrigation,
      icon: Droplets,
      accent: "border-l-4 border-l-sky-500",
    },
    {
      title: "Soil Improvement Advice",
      body: soil,
      icon: Shovel,
      accent: "border-l-4 border-l-amber-600",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-[12px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-5"
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#0D6B45] mb-4">
        AI Recommendations
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map(({ title, body, icon: Icon, accent }) => (
          <div
            key={title}
            className={`rounded-[12px] bg-[#fafcfb] border border-gray-100 shadow-sm p-4 ${accent}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5 text-[#0D6B45]" />
              <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{body || "—"}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
