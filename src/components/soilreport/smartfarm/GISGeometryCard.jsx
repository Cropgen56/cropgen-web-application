import React from "react";
import { motion } from "framer-motion";
import { MapPinned, ShieldCheck } from "lucide-react";
import { polygonCentroidLatLng } from "./utils";

export default function GISGeometryCard({ field }) {
  const pts = field?.field?.length ?? 0;
  const c = polygonCentroidLatLng(field?.field);
  const latStr = c.lat != null ? c.lat.toFixed(5) : "—";
  const lngStr = c.lng != null ? c.lng.toFixed(5) : "—";
  const closed =
    pts >= 3 &&
    field.field[0]?.lat === field.field[pts - 1]?.lat &&
    field.field[0]?.lng === field.field[pts - 1]?.lng;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-[12px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[#0D6B45] flex items-center gap-2">
          <MapPinned className="w-4 h-4" />
          Field Geometry / GIS
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          GIS Verified
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-[10px] bg-[#f8fbf9] border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Total boundary points</p>
          <p className="text-xl font-bold text-gray-900">{pts || "—"}</p>
        </div>
        <div className="rounded-[10px] bg-[#f8fbf9] border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Centroid (lat / lng)</p>
          <p className="text-sm font-semibold text-gray-900 font-mono">
            {latStr} N · {lngStr} E
          </p>
        </div>
        <div className="sm:col-span-2 rounded-[10px] bg-[#f8fbf9] border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium">Polygon summary</p>
          <p className="text-sm text-gray-800 mt-1 leading-relaxed">
            Parcel digitized as a {closed ? "closed" : "open"} polygon with{" "}
            <strong>{pts}</strong> vertices. Coordinates are referenced in WGS84 for satellite
            alignment and export.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
