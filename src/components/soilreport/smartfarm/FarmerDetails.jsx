import React from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone } from "lucide-react";

export default function FarmerDetails({ name, email, phone }) {
  const rows = [
    { icon: User, label: "Farmer Name", value: name || "—" },
    { icon: Mail, label: "Email", value: email || "—" },
    { icon: Phone, label: "Phone", value: phone || "—" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-[12px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-5"
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#0D6B45] mb-4">
        Farmer Details
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {rows.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-[10px] bg-[#f8fbf9] border border-gray-100 px-4 py-3"
          >
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>
            <p className="text-sm font-semibold text-gray-900 break-all">{value}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
