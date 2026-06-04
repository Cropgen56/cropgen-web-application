import React, { useState, useEffect } from "react";
import { Operation2 } from "../../../assets/Icons";
import { CiSearch } from "react-icons/ci";
import { FileText, Download, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { message } from "antd";
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
        ? "bg-white/12 border-l-[3px] border-l-emerald-300 pl-2.5"
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

const SoilReportSidebar = ({
  selectedOperation,
  setSelectedOperation,
  setSelectedField,
  onGenerateReport,
  downloadPDF,
  reportReady = false,
  isGeneratingReport = false,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fields = useSelector((state) => state.farmfield.fields) || [];

  useEffect(() => {
    if (selectedOperation?._id) {
      setSelectedFieldId(selectedOperation._id);
    }
  }, [selectedOperation?._id]);

  if (!isSidebarVisible) return null;

  const sortedFields = [...fields].reverse();

  const filteredFields = sortedFields.filter((f) =>
    (f.fieldName || f.farmName || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const calculateCentroid = (polygon) => {
    if (!polygon || polygon.length === 0) {
      return { lat: "0.000", lon: "0.000" };
    }

    const total = polygon.reduce(
      (acc, point) => ({
        lat: acc.lat + Number(point?.lat || 0),
        lng: acc.lng + Number(point?.lng || 0),
      }),
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

  const selectedFieldObj = fields.find((f) => f._id === selectedFieldId);

  const handleSelectField = (field) => {
    setSelectedFieldId(field._id);
    setSelectedOperation(field);

    if (typeof setSelectedField === "function") {
      setSelectedField(field);
    }
  };

  const handleGenerateClick = () => {
    if (!selectedFieldObj) {
      message.warning("Please select a field first.");
      return;
    }

    if (typeof onGenerateReport !== "function") {
      message.error("Generate report function is not connected.");
      return;
    }

    onGenerateReport(selectedFieldObj);
  };

  const handleDownloadClick = () => {
    if (typeof downloadPDF !== "function") {
      message.error("Download function is not connected.");
      return;
    }

    downloadPDF();
  };

  return (
    <div
      className="h-full w-[260px] xl:w-[300px] flex flex-col text-white shrink-0 shadow-xl"
      style={{ backgroundColor: SIDEBAR_BG }}
    >
      <div
        className="shrink-0 px-3 py-3 border-b border-white/15"
        style={{
          background: `linear-gradient(180deg, ${SIDEBAR_BG}, ${SIDEBAR_HOVER})`,
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-white/10 shrink-0">
              <Operation2 />
            </div>

            <div className="min-w-0">
              <p className="text-base font-bold m-0 truncate">Soil Report</p>
              <p className="text-[10px] text-white/55">
                Smart farm intelligence
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Hide sidebar"
            className="cursor-pointer p-1 rounded-md hover:bg-white/10 transition-colors shrink-0"
            onClick={() => setIsSidebarVisible(false)}
          >
            <svg width="24" height="24" viewBox="0 0 30 30" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.3662 15.8835C10.1319 15.6491 10.0002 14.9998 10.0002 14.9998C10.0002 14.6683 10.1319 14.3504 10.3662 14.116L17.4375 7.04478C17.6732 6.81708 17.989 6.69109 18.3167 6.69393C18.6445 6.69678 18.958 6.82824 19.1898 7.06C19.4215 7.29176 19.553 7.60528 19.5558 7.93303C19.5587 8.26077 19.4327 8.57652 19.205 8.81228L13.0175 14.9998L19.205 21.1873C19.4327 21.423 19.5587 21.7388 19.5558 22.0665C19.553 22.3943 19.4215 22.7078 19.1898 22.9395C18.958 23.1713 18.6445 23.3028 18.3167 23.3056C17.989 23.3085 17.6732 23.1825 17.4375 22.9548L10.3662 15.8835Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

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

      <div className="shrink-0 flex items-center justify-between px-3 py-2 bg-black/10 text-xs text-white/55 font-semibold uppercase tracking-wide">
        <span>Farms</span>
        <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-white/75 normal-case">
          {filteredFields.length}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {filteredFields.map((field) => {
          const { lat, lon } = calculateCentroid(field.field);
          const isSelected = selectedFieldId === field._id;
          const isSubscribed =
            field.subscription?.hasActiveSubscription === true;

          return (
            <FieldInfo
              key={field._id}
              title={field.fieldName || field.farmName || "Field"}
              area={formatArea(field.acre)}
              lat={lat}
              lon={lon}
              coordinates={field.field}
              isSelected={isSelected}
              isSubscribed={isSubscribed}
              onClick={() => handleSelectField(field)}
            />
          );
        })}
      </div>

      {selectedFieldId && selectedFieldObj && (
        <div className="mt-auto p-4 border-t border-white/15 space-y-3 bg-black/10">
          <div className="rounded-lg bg-white/10 border border-white/15 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">
              Selected field
            </p>

            <p className="text-sm font-bold text-white truncate">
              {selectedFieldObj.fieldName || selectedFieldObj.farmName || "Field"}
            </p>
          </div>

          {!reportReady ? (
            <button
              type="button"
              onClick={handleGenerateClick}
              disabled={isGeneratingReport}
              className="w-full flex items-center justify-center gap-2 font-semibold text-[#344e41] rounded-xl px-3 py-3 bg-white hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Generate Report
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDownloadClick}
              className="w-full flex items-center justify-center gap-2 font-semibold text-white rounded-xl px-3 py-3 border-2 border-white/40 hover:bg-white/10 transition-colors"
            >
              <Download size={18} />
              Download PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SoilReportSidebar;