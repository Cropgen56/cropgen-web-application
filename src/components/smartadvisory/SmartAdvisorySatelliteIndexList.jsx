import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useDispatch } from "react-redux";
import {
  fetchIndexData,
  removeSelectedIndexData,
} from "../../redux/slices/satelliteSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";

const index_name_mapping = {
  NDVI: "Crop Health",
  EVI: "Improved Health",
  EVI2: "Health (Simple)",
  SAVI: "Early Stage",
  MSAVI: "Dry Land",
  NDMI: "Water Content",
  NDWI: "Water Level",
  SMI: "Soil Moisture",
  CCC: "Leaf Green",
  NITROGEN: "Nitrogen",
  SOC: "Soil Fertility",
  NDRE: "Crop Stress",
  RECI: "Leaf Rich",
  TRUE_COLOR: "True Color",
};

const indices = [
  "TRUE_COLOR",
  "NDVI",
  "EVI",
  "EVI2",
  "SAVI",
  "MSAVI",
  "NDMI",
  "NDWI",
  "SMI",
  "CCC",
  "NITROGEN",
  "SOC",
  "NDRE",
  "RECI",
];

const SmartAdvisorySatelliteIndexList = ({
  selectedFieldsDetials = [],
  selectedDate = null,
}) => {
  const [selectedIndex, setSelectedIndex] = useState("NDVI");
  const dispatch = useDispatch();
  const { sowingDate = null } = selectedFieldsDetials[0] || {};
  const scrollContainerRef = useRef(null);

  // Validate that the geometry is a closed polygon
  const validateGeometry = (field) => {
    if (!field || field.length < 3) return false;
    const first = field[0];
    const last = field[field.length - 1];
    return first.lat === last.lat && first.lng === last.lng;
  };

  const coordinates = useMemo(() => {
    const field = selectedFieldsDetials[0]?.field;
    if (!field || field.length < 3) {
      console.warn("Invalid geometry provided: insufficient points", field);
      return [];
    }

    // Map to [lng, lat] format
    let coords = field.map(({ lat, lng }) => [lng, lat]);

    if (!validateGeometry(field)) {
      coords = [...coords, coords[0]];
    }

    return coords;
  }, [selectedFieldsDetials]);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleFetchIndex = useCallback(
    (index) => {
      if (!selectedDate || !coordinates.length || !index) return;
      dispatch(
        fetchIndexData({
          endDate: selectedDate,
          geometry: [coordinates],
          index,
        })
      );
    },
    [selectedDate, coordinates, dispatch]
  );

  const debouncedFetchIndex = useMemo(
    () => debounce(handleFetchIndex, 300),
    [handleFetchIndex]
  );

  useEffect(() => {
    dispatch(removeSelectedIndexData());
    debouncedFetchIndex(selectedIndex);
    return () => {
      clearTimeout(debouncedFetchIndex.timeout);
    };
  }, [
    selectedIndex,
    selectedDate,
    sowingDate,
    coordinates,
    debouncedFetchIndex,
    dispatch,
  ]);

  const handleArrowRightClick = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 150,
        behavior: "smooth",
      });
    }
  };

  const handleArrowLeftClick = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -150,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full mx-auto shadow-md overflow-hidden">
      <div className="flex items-center gap-1 p-1 relative bg-[#5a7c6b] rounded-t-md">
        {/* Dropdown - Compact */}
        <select className="text-white text-[10px] bg-[#344e41] font-medium border border-white/30 outline-none rounded h-[28px] min-w-[70px] px-1">
          <option value="satellite1">Sat 1</option>
          <option value="satellite2">Sat 2</option>
          <option value="satellite3">Sat 3</option>
        </select>

        {/* Left Arrow */}
        <button
          className="bg-[#344e41] p-0.5 text-white rounded cursor-pointer z-10 flex-shrink-0"
          onClick={handleArrowLeftClick}
        >
          <ChevronLeft size={16} strokeWidth={2} />
        </button>

        {/* Scrollable Index Buttons */}
        <div className="relative flex-1 overflow-hidden">
          <div
            className="flex gap-1 flex-nowrap overflow-x-auto scroll-smooth no-scrollbar"
            ref={scrollContainerRef}
          >
            {indices.map((index) => (
              <button
                key={index}
                className={`flex-shrink-0 rounded text-white font-medium px-2 py-1 text-[10px] h-[28px] whitespace-nowrap transition-all duration-200 ease-in-out
                  ${
                    selectedIndex === index
                      ? "bg-[#344e41]"
                      : "bg-[#5a7c6b] hover:bg-[#4a6b5a] border border-white/20"
                  }`}
                onClick={() => {
                  dispatch(removeSelectedIndexData());
                  setSelectedIndex(index);
                }}
              >
                {index_name_mapping[index] || index}
              </button>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          className="bg-[#344e41] p-0.5 text-white rounded cursor-pointer z-10 flex-shrink-0"
          onClick={handleArrowRightClick}
        >
          <ChevronRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default SmartAdvisorySatelliteIndexList;