import React, { useState, useEffect } from "react";
import { Operation2 } from "../../../assets/Icons";
import { CiSearch } from "react-icons/ci";
import { FileText, Download } from "lucide-react";
import { useSelector } from "react-redux";
import PolygonPreview from "../../polygon/PolygonPreview";

const SIDEBAR_BG = "#344e41";
const SIDEBAR_HOVER = "#5a7c6b";

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
    className={`flex items-center gap-1.5 md:gap-2.5 border-b border-white/15 py-3 px-2 cursor-pointer transition-colors ${
      isSelected ? "bg-white/10" : "bg-transparent hover:bg-white/5"
    }`}
    onClick={onClick}
  >
    <PolygonPreview coordinates={coordinates} isSelected={isSelected} />
    <div className="flex-grow min-w-0">
      <div className="flex items-center justify-between mb-1 gap-1">
        <h4
          className={`text-base truncate ${isSelected ? "text-white" : "text-white/90"}`}
        >
          {title.length > 8 ? `${title.slice(0, 8)}...` : title}
        </h4>
        <div
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${
            isSubscribed
              ? "bg-emerald-400/20 text-emerald-100 border border-emerald-300/40"
              : "bg-red-500/20 text-red-100 border border-red-300/40"
          }`}
        >
          {isSubscribed ? "Subscribed" : "Unsubscribed"}
        </div>
      </div>
      <p className="text-xs text-white/70 mb-1">{area}</p>
      <div className="flex gap-4 text-xs text-white/60">
        <p>{lat} N</p>
        <p>{lon} E</p>
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
  reportReady,
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
    (f.fieldName || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const calculateCentroid = (polygon) => {
    if (!polygon || polygon.length === 0) return { lat: 0, lon: 0 };
    const total = polygon.reduce(
      (acc, point) => ({ lat: acc.lat + point.lat, lng: acc.lng + point.lng }),
      { lat: 0, lng: 0 },
    );
    return {
      lat: (total.lat / polygon.length).toFixed(3),
      lon: (total.lng / polygon.length).toFixed(3),
    };
  };

  const formatArea = (acres) => `${acres ? Number(acres).toFixed(3) : 0} acres`;

  const selectedFieldObj = fields.find((f) => f._id === selectedFieldId);

  return (
    <div
      className="sm:min-w-[280px] sm:max-w-[22vw] m-0 p-0 shadow-xl flex flex-col h-screen relative overflow-y-auto text-white"
      style={{ backgroundColor: SIDEBAR_BG }}
    >
      <div
        className="flex flex-col border-b border-white/15 gap-2 px-3 py-3"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Operation2 />
            <p className="text-[18px] font-bold m-0 tracking-tight">CropGen</p>
          </div>
          <button
            type="button"
            aria-label="Hide sidebar"
            className="cursor-pointer p-1 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setIsSidebarVisible(false)}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 30 30"
              fill="none"
              className="text-white"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.3662 15.8835C10.1319 15.6491 10.0002 14.9998 10.0002 14.9998C10.0002 14.6683 10.1319 14.3504 10.3662 14.116L17.4375 7.04478C17.6732 6.81708 17.989 6.69109 18.3167 6.69393C18.6445 6.69678 18.958 6.82824 19.1898 7.06C19.4215 7.29176 19.553 7.60528 19.5558 7.93303C19.5587 8.26077 19.4327 8.57652 19.205 8.81228L13.0175 14.9998L19.205 21.1873C19.4327 21.423 19.5587 21.7388 19.5558 22.0665C19.553 22.3943 19.4215 22.7078 19.1898 22.9395C18.958 23.1713 18.6445 23.3028 18.3167 23.3056C17.989 23.3085 17.6732 23.1825 17.4375 22.9548L10.3662 15.8835Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className="relative flex items-center mx-auto w-full">
          <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-lg pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-[10px] border border-white/20 text-white text-sm outline-none placeholder:text-white/50 focus:border-white/40"
            style={{ backgroundColor: SIDEBAR_HOVER }}
            placeholder="Search farm"
          />
        </div>
      </div>

      <h2 className="px-4 pt-3 text-[15px] font-bold text-white/90 uppercase tracking-wide">
        Farm list
      </h2>
      <div className="flex flex-col overflow-y-auto no-scrollbar flex-1">
        {filteredFields.map((field) => {
          const { lat, lon } = calculateCentroid(field.field);
          const isSelected = selectedFieldId === field._id;
          const isSubscribed = field.subscription?.hasActiveSubscription === true;

          return (
            <FieldInfo
              key={field._id}
              title={field.fieldName || "Field"}
              area={formatArea(field.acre)}
              lat={lat}
              lon={lon}
              coordinates={field.field}
              isSelected={isSelected}
              isSubscribed={isSubscribed}
              onClick={() => {
                setSelectedFieldId(field._id);
                setSelectedOperation(field);
                setSelectedField(field);
              }}
            />
          );
        })}
      </div>

      {selectedFieldId && selectedFieldObj && (
        <div className="mt-auto p-4 border-t border-white/15 space-y-3 bg-black/10">
          <div className="rounded-[12px] bg-white/10 border border-white/15 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">
              Selected field
            </p>
            <p className="text-sm font-bold text-white truncate">
              {selectedFieldObj.fieldName || selectedFieldObj.farmName}
            </p>
          </div>
          {!reportReady ? (
            <button
              type="button"
              onClick={() => onGenerateReport(selectedFieldObj)}
              className="w-full flex items-center justify-center gap-2 font-semibold text-[#0D6B45] rounded-[12px] px-3 py-3 bg-white hover:bg-gray-100 transition-colors shadow-lg"
            >
              <FileText size={18} />
              Generate Report
            </button>
          ) : (
            <button
              type="button"
              onClick={downloadPDF}
              className="w-full flex items-center justify-center gap-2 font-semibold text-white rounded-[12px] px-3 py-3 border-2 border-white/40 hover:bg-white/10 transition-colors"
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
