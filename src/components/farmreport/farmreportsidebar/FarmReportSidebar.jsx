import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Weather2 } from "../../../assets/Globalicon";
import { CiSearch } from "react-icons/ci";
import PolygonPreview from "../../polygon/PolygonPreview";
import { ArrowDownToLine, LoaderCircle } from "lucide-react";

const FieldInfo = ({
  title,
  area,
  lat,
  lon,
  isSelected,
  onClick,
  coordinates,
}) => (
  <div
    className={`flex items-center gap-4 border-b border-[#344e41] py-3 px-2 cursor-pointer ${
      isSelected ? "bg-[#5a7c6b]" : "bg-transparent"
    }`}
    onClick={onClick}
  >
    <PolygonPreview coordinates={coordinates} isSelected={isSelected} />
    <div>
      <h4
        className={`text-base ${isSelected ? "text-white" : "text-[#344e41]"}`}
      >
        {title}
      </h4>
      <p className="text-xs text-[#a2a2a2] mb-1">{area}</p>
      <div className="flex gap-4 text-xs text-[#a2a2a2]">
        <p>{lat} N</p>
        <p>{lon} E</p>
      </div>
    </div>
  </div>
);

const FarmReportSidebar = ({
  setSelectedField,
  selectedField,
  downloadPDF,
  currentFieldHasSubscription,
}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fields = useSelector((state) => state?.farmfield?.fields) || [];

  // Sort fields in descending order (latest first)
  const sortedFields = [...fields].sort((a, b) => {
    // If fields have createdAt timestamp
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    // Otherwise sort by _id (assuming newer IDs are lexicographically greater)
    return b._id.localeCompare(a._id);
  });

  // calculate the centroid of a field
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

  const formatArea = (acres) => {
    const hectares = (acres * 0.404686).toFixed(2);
    return `${hectares}h`;
  };

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const filteredFields = sortedFields.filter((field) =>
    field.fieldName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async () => {
    setLoading(true);
    await downloadPDF();
    setLoading(false);
  };

  if (!isSidebarVisible) return null;

  return (
    <div className="relative sm:min-w-[250px] sm:max-w-[20vw] bg-white shadow-md flex flex-col h-screen">
      <div className="flex flex-col border-b border-[#344e41] gap-2 px-3 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Weather2 />
            <h2 className="text-[18px] font-bold text-[#344e41]">
              Farm Report
            </h2>
          </div>
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={toggleSidebarVisibility}
            style={{ cursor: "pointer" }}
          >
            <g clipPath="url(#clip0_302_105)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.3662 15.8835C10.1319 15.6491 10.0002 15.3312 10.0002 14.9998C10.0002 14.6683 10.1319 14.3504 10.3662 14.116L17.4375 7.04478C17.6732 6.81708 17.989 6.69109 18.3167 6.69393C18.6445 6.69678 18.958 6.82824 19.1898 7.06C19.4215 7.29176 19.553 7.60528 19.5558 7.93303C19.5587 8.26077 19.4327 8.57652 19.205 8.81228L13.0175 14.9998L19.205 21.1873C19.4327 21.423 19.5587 21.7388 19.5558 22.0665C19.553 22.3943 19.4215 22.7078 19.1898 22.9395C18.958 23.1713 18.6445 23.3028 18.3167 23.3056C17.989 23.3085 17.6732 23.1825 17.4375 22.9548L10.3662 15.8835Z"
                fill="#344e41"
              />
            </g>
            <defs>
              <clipPath id="clip0_302_105">
                <rect
                  width="30"
                  height="30"
                  fill="white"
                  transform="matrix(0 -1 1 0 0 30)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
        <div className="relative flex items-center mx-auto w-full">
          <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-100 text-lg" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 text-gray-100 text-sm outline-none bg-[#344e41] focus:border-none"
            placeholder="Search"
          />
        </div>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-150px)] no-scrollbar">
        <h2 className="text-[18px] font-bold text-[#344e41] p-2">All Farms</h2>
        {filteredFields.length > 0 ? (
          filteredFields.map((field) => {
            const { lat, lon } = calculateCentroid(field.field);
            return (
              <FieldInfo
                key={field._id}
                title={field.fieldName}
                area={formatArea(field.acre)}
                lat={lat}
                lon={lon}
                coordinates={field.field}
                isSelected={field._id === selectedField}
                onClick={() => setSelectedField(field._id)}
              />
            );
          })
        ) : (
          <p className="text-center text-sm text-gray-500 mt-4">
            No fields found
          </p>
        )}
      </div>
      <div className="mt-auto sticky bottom-0 bg-white p-3  z-10">
        {/* {currentFieldHasSubscription ? ( */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-[#344e41] text-white py-2 rounded-md hover:bg-[#2d4036] transition-all duration-300"
          >
            {loading && <LoaderCircle className="animate-spin" size={18} />}
            {loading ? (
              "Downloading..."
            ) : (
              <>
                <ArrowDownToLine size={18} /> Download Farm Report
              </>
            )}
          </button>
        {/* ) : null}  */}
      </div>
    </div>
  );
};

export default FarmReportSidebar;
