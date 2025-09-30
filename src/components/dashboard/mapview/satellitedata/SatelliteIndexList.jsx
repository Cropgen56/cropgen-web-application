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
} from "../../../../redux/slices/satelliteSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";

const index_name_mapping = {
  NDVI: "Crop Health",
  EVI: "Improved Crop Health",
  EVI2: "Crop Health (Simplified)",
  SAVI: "Crop Health (Early Stage)",
  MSAVI: "Crop Health (Dry Land)",
  NDMI: "Water in Crop",
  NDWI: "Plant Water Level",
  SMI: "Soil Moisture",
  CCC: "Leaf Greenness",
  NITROGEN: "Nitrogen Level",
  SOC: "Soil Fertility",
  NDRE: "Crop Stress / Maturity",
  RECI: "Leaf Richness",
  TRUE_COLOR: "True Color Image",
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

const SatelliteIndexList = ({
  selectedFieldsDetials = [],
  selectedDate = null,
}) => {
  const [selectedIndex, setSelectedIndex] = useState("NDVI");
  const dispatch = useDispatch();
  const { field = [], sowingDate = null } = selectedFieldsDetials[0] || {};
  const scrollContainerRef = useRef(null);

  // Validate that the geometry is a closed polygon
  const validateGeometry = (field) => {
    if (!field || field.length < 3) return false; // At least 3 points for a polygon (4 with closure)
    const first = field[0];
    const last = field[field.length - 1];
    return first.lat === last.lat && first.lng === last.lng; // Check if first and last points match
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
        left: 200,
        behavior: "smooth",
      });
    }
  };

  const handleArrowLeftClick = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full mx-auto my-1 shadow-md overflow-hidden">
      <div className="flex items-center gap-1 lg:gap-2 p-1 lg:p-2 relative">
        {/* Dropdown */}
        <select className="text-white text-xs bg-[#5a7c6b] font-medium border border-white outline-none rounded-md h-[40px] min-w-[110px] px-2 py-2 lg:min-w-[135px] md:h-[40px] md:px-4 md:py-2 lg:text-sm">
          <option className="text-xs" value="satellite1">
            Satellite 1
          </option>
          <option className="text-xs" value="satellite2">
            Satellite 2
          </option>
          <option className="text-xs" value="satellite3">
            Satellite 3
          </option>
        </select>

        {/* Arrow buttons */}
        <button
          className="absolute left-[120px] lg:left-[150px] bg-[#344e41] py-1 text-white rounded cursor-pointer z-10"
          onClick={handleArrowLeftClick}
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>

        {/* Wrapper to clip overflow behind arrows */}
        <div className="relative flex-1 overflow-hidden px-[40px]">
          <div
            className="flex gap-1 lg:gap-2 flex-nowrap overflow-x-auto scroll-smooth no-scrollbar"
            ref={scrollContainerRef}
          >
            {indices.map((index) => (
              <button
                key={index}
                className={`flex-shrink-0 rounded text-white font-medium px-2 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm h-[46px] sm:h-[44px] sm:px-3 sm:py-2 transition-all duration-300 ease-in-out
                  ${
                    selectedIndex === index
                      ? "bg-[#344e41]"
                      : "bg-[#5a7c6b] hover:bg-[#4a6b5a]"
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

        <button
          className="absolute right-2 bg-[#344e41] text-white py-1 rounded cursor-pointer z-10 sm:right-1"
          onClick={handleArrowRightClick}
        >
          <ChevronRight size={24} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default SatelliteIndexList;
