import React from "react";
import { motion } from "framer-motion";
import { MapPin, Sprout, Droplets, Tractor } from "lucide-react";

export default function FieldDetails({ field }) {
  const name = field?.fieldName || field?.farmName || "—";
  const crop = field?.cropName || "—";
  const variety = field?.variety || field?.cropVariety || "—";
  const sowing =
    field?.sowingDate ||
    field?.sowing_date ||
    (field?.createdAt
      ? new Date(field.createdAt).toLocaleDateString()
      : "—");
  const acre = field?.acre != null ? `${Number(field.acre).toFixed(3)} ac` : "—";
  const irrigation = field?.typeOfIrrigation || field?.irrigationType || "—";
  const farming = field?.typeOfFarming || field?.farmingType || "—";

  const items = [
    { icon: MapPin, label: "Field Name", value: name },
    { icon: Sprout, label: "Crop Name", value: crop },
    { icon: Sprout, label: "Variety", value: variety },
    { label: "Sowing Date", value: sowing },
    { label: "Total Acre", value: acre },
    { icon: Droplets, label: "Irrigation Type", value: irrigation },
    { icon: Tractor, label: "Farming Type", value: farming },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-[12px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-5"
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#0D6B45] mb-4">
        Field Details
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-[10px] border border-gray-100 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
              {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
              {label}
            </p>
            <p className="text-sm font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
