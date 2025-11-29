import React, { useState } from "react";
import { SmartAdvisoryDarkIcon } from "../../../assets/Icons";
import { CiSearch } from "react-icons/ci";
import { useSelector } from "react-redux";
import PolygonPreview from "../../polygon/PolygonPreview";

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
    className={`flex items-center gap-4 border-b border-[#344e41] py-3 px-2 cursor-pointer ${
      isSelected ? "bg-[#5a7c6b]" : "bg-transparent"
    }`}
    onClick={onClick}
  >
    <PolygonPreview coordinates={coordinates} isSelected={isSelected} />
    <div className="flex-grow">
      <div className="flex items-center justify-between mb-1">
        <h4 className={`text-base ${isSelected ? "text-white" : "text-[#344e41]"}`}>
          {title}
        </h4>
        <div
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
            isSubscribed
              ? "bg-[#DAFFED] text-[#28C878] border border-[#28C878]/30"
              : "bg-[#FFDEDF] text-[#EC1C24] border border-[#EC1C24]/30"
          }`}
        >
          {isSubscribed ? "Subscribed" : "Unsubscribed"}
        </div>
      </div>
      <p className="text-xs text-[#a2a2a2] mb-1">{area}</p>
      <div className="flex gap-4 text-xs text-[#a2a2a2]">
        <p>{lat} N</p>
        <p>{lon} E</p>
      </div>
    </div>
  </div>
);

const SmartAdvisorySidebar = ({ setSelectedField, setIsSidebarVisible }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fields = useSelector((state) => state.farmfield.fields) || [];

  const filteredFields = fields
    .filter((field) =>
      field.fieldName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const calculateCentroid = (field) => {
    if (!field || field.length === 0) return { lat: 0, lon: 0 };
    const total = field.reduce(
      (acc, point) => ({
        lat: acc.lat + point.lat,
        lng: acc.lng + point.lng,
      }),
      { lat: 0, lng: 0 }
    );
    return {
      lat: (total.lat / field.length).toFixed(3),
      lon: (total.lng / field.length).toFixed(3),
    };
  };

  const formatArea = (acres) => `${(acres * 0.404686).toFixed(2)}h`;

  return (
    <div className="min-w-[250px] bg-white shadow-md flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col border-b border-[#344e41] gap-2 px-3 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SmartAdvisoryDarkIcon />
            <h2 className="text-[18px] font-bold text-[#344e41]">Smart Advisory</h2>
          </div>
          {/* Full SVG Close Icon */}
          <div
            className="cursor-pointer"
            onClick={() => setIsSidebarVisible(false)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="#344E41"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="#344E41"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="relative flex items-center w-full mt-2">
          <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-100 text-lg" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 text-gray-100 text-sm outline-none bg-[#344e41]"
            placeholder="Search"
          />
        </div>
      </div>

      {/* Fields List */}
      <div className="overflow-y-auto max-h-[calc(100vh-150px)] no-scrollbar">
        <h2 className="font-bold text-[#344e41] text-[18px] p-2">All Farms</h2>
        {filteredFields.length > 0 ? (
          filteredFields.map((field, index) => {
            const { lat, lon } = calculateCentroid(field.field);
            const isSelected = selectedIndex === index;
            const isSubscribed = field.subscription?.hasActiveSubscription ?? false;

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
          <p className="text-center text-sm text-gray-500 mt-4">No fields found</p>
        )}
      </div>
    </div>
  );
};

export default SmartAdvisorySidebar;
