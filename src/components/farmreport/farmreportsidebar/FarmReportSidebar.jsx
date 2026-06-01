import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Weather2 } from "../../../assets/Globalicon";
import { CiSearch } from "react-icons/ci";
import { CloudRain } from "lucide-react";
import PolygonPreview from "../../polygon/PolygonPreview";

const SIDEBAR_BG = "#344e41";
const SIDEBAR_HOVER = "#2b4035";

const FieldInfo = ({
  title,
  area,
  lat,
  lon,
  isSelected,
  onClick,
  coordinates,
  isSubscribed,
}) => (
  <div
    className={`flex items-center gap-2 border-b border-white/12 py-3 px-3 cursor-pointer transition-colors ${
      isSelected
        ? "bg-white/12 border-l-[3px] border-l-ember-accent pl-2.5"
        : "hover:bg-white/5 border-l-[3px] border-l-transparent"
    }`}
    onClick={onClick}
  >
    <PolygonPreview coordinates={coordinates} isSelected={isSelected} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <h4
          className={`text-sm font-semibold truncate ${
            isSelected ? "text-white" : "text-white/90"
          }`}
          title={title}
        >
          {title}
        </h4>
        <span
          className={`shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
            isSubscribed
              ? "bg-emerald-400/25 text-emerald-50"
              : "bg-red-500/20 text-red-100"
          }`}
        >
          {isSubscribed ? "Active" : "Off"}
        </span>
      </div>
      <p className="text-[11px] text-white/60 truncate">{area}</p>
      <div className="flex gap-2 text-[10px] text-white/50 mt-0.5">
        <span>{lat}°N</span>
        <span>{lon}°E</span>
      </div>
    </div>
  </div>
);

const FarmReportSidebar = ({ setSelectedField, setIsSidebarVisible }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fields = useSelector((state) => state.farmfield.fields) || [];

  // Sort fields in descending order (latest first)
  const filteredFields = [...fields]
    .reverse()
    .filter((field) =>
      field.fieldName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const calculateCentroid = (polygon) => {
    if (!polygon?.length) return { lat: "0.000", lon: "0.000" };
    const total = polygon.reduce(
      (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
      { lat: 0, lng: 0 }
    );
    return {
      lat: (total.lat / polygon.length).toFixed(3),
      lon: (total.lng / polygon.length).toFixed(3),
    };
  };

  const formatArea = (acres) => {
    const ha = ((acres ?? 0) * 0.404686).toFixed(2);
    return `${ha} ha`;
  };

  return (
    <div
      className="h-full w-[260px] xl:w-[280px] flex flex-col text-white shrink-0"
      style={{ backgroundColor: SIDEBAR_BG }}
    >
      {/* Header */}
      <div
        className="shrink-0 px-3 py-3 border-b border-white/15"
        style={{ background: `linear-gradient(180deg, ${SIDEBAR_BG}, ${SIDEBAR_HOVER})` }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-white/10 shrink-0">
              <Weather2 />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold truncate">Farm Report</h2>
              <p className="text-[10px] text-white/55">Monitor your farms</p>
            </div>
          </div>
          {/* Close Icon */}
          <button
            onClick={() => setIsSidebarVisible(false)}
            className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            aria-label="Close sidebar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-current"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <CiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/45 text-base pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-2 py-2 rounded-lg bg-white/10 border border-white/15 text-white text-sm placeholder:text-white/40 outline-none focus:border-white/30"
            placeholder="Search farms..."
          />
        </div>
      </div>

      {/* Fields Count */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 bg-black/10 text-xs text-white/55 font-semibold uppercase tracking-wide">
        <span>Farms</span>
        <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-white/75 normal-case">
          {filteredFields.length}
        </span>
      </div>

      {/* Fields List */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {filteredFields.length > 0 ? (
          filteredFields.map((field, index) => {
            const { lat, lon } = calculateCentroid(field.field);
            const isSelected = selectedIndex === index;
            const isSubscribed = field.subscription?.hasActiveSubscription === true;

            return (
              <FieldInfo
                key={field._id}
                title={field.fieldName}
                area={formatArea(field.acre)}
                lat={lat}
                lon={lon}
                isSelected={isSelected}
                coordinates={field.field}
                isSubscribed={isSubscribed}
                onClick={() => {
                  setSelectedIndex(index);
                  setSelectedField(field);
                  setIsSidebarVisible(false);
                }}
              />
            );
          })
        ) : (
          <div className="text-center py-10 px-3">
            <CloudRain className="mx-auto mb-2 text-white/25" size={28} />
            <p className="text-xs text-white/55">No farms found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmReportSidebar;