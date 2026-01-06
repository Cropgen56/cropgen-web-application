import React, { useState } from "react";
import { Operation2 } from "../../../assets/Icons";
import { CiSearch } from "react-icons/ci";
import { useSelector } from "react-redux";
import PolygonPreview from "../../polygon/PolygonPreview";
import { ChevronLeft } from "lucide-react";

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
    className={`flex items-center gap-1.5 md:gap-2.5 border-b border-[#344e41] py-3 px-2 cursor-pointer ${
      isSelected ? "bg-[#5a7c6b]" : "bg-transparent"
    }`}
    onClick={onClick}
  >
    <PolygonPreview coordinates={coordinates} isSelected={isSelected} />
    <div className="flex-grow">
      <div className="flex items-center justify-between mb-1">
        <h4
          className={`text-base ${
            isSelected ? "text-white" : "text-[#344e41]"
          }`}
        >
          {title.length > 8 ? `${title.slice(0, 8)}...` : title}
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

const OperationSidebar = ({ setSelectedField, selectedField }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const fields = useSelector((state) => state.farmfield.fields) || [];

  const sortedFields = [...fields].reverse();

  const filteredFields = sortedFields.filter((field) =>
    field.fieldName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (!isSidebarVisible) return null;

  return (
    <div className="w-full sm:min-w-[250px] sm:max-w-[20vw] bg-white shadow-md flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col border-b border-[#344e41] gap-2 px-3 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Operation2 />
            <h2 className="text-[18px] font-bold text-[#344e41]">Operations</h2>
          </div>

          <button
            onClick={() => setIsSidebarVisible(false)}
            className="text-[#344e41] font-bold"
          >
            {/* Close */}
            <ChevronLeft color="#344E41" />
          </button>
        </div>

        <div className="relative flex items-center mx-auto w-full">
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

      <div className="overflow-y-auto max-h-[calc(100vh-150px)] no-scrollbar">
        <h2 className="text-[18px] font-bold text-[#344e41] p-2">All Farms</h2>

        {filteredFields.length > 0 ? (
          filteredFields.map((field) => {
            const { lat, lon } = calculateCentroid(field.field);
            const isSelected = selectedField?._id === field._id;

            const isSubscribed =
              field.subscription?.hasActiveSubscription === true;

            return (
              <FieldInfo
                key={field._id}
                title={field.fieldName}
                area={formatArea(field.acre)}
                lat={lat}
                lon={lon}
                coordinates={field.field}
                isSelected={isSelected}
                isSubscribed={isSubscribed}
                onClick={() => setSelectedField(field)}
              />
            );
          })
        ) : (
          <p className="text-center text-sm text-gray-500 mt-4">
            No fields found
          </p>
        )}
      </div>
    </div>
  );
};

export default OperationSidebar;
