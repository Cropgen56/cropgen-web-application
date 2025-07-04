import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { GratterThan } from "../../../../assets/Icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIndexData,
  removeSelectedIndexData,
} from "../../../../redux/slices/satelliteSlice";

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

  const coordinates = useMemo(() => {
    const coords = field?.map(({ lat, lng }) => [lng, lat]) || [];
    return coords;
  }, [field]);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleFetchIndex = useCallback(
    (index) => {
      if (!sowingDate || !selectedDate || !coordinates.length || !index) return;
      dispatch(
        fetchIndexData({
          startDate: sowingDate,
          endDate: selectedDate,
          geometry: [coordinates],
          index,
        })
      );
    },
    [sowingDate, selectedDate, coordinates, dispatch]
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

  const handleArrowClick = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-[99%] mx-auto my-1 shadow-md overflow-hidden">
      <div className="flex items-center gap-2 p-2 relative">
       <select
        className="text-white bg-[#5a7c6b] font-medium border border-white rounded-md
                  text-sm h-[40px] min-w-[115px] px-3 py-2
                  md:min-w-[135px] md:h-[46px] md:px-4 md:py-2 md:text-base"
        style={{
          fontSize: "0.8rem",
        }}
      >
        <option style={{ fontSize: "0.8rem" }} value="satellite1">
          Satellite 1
        </option>
        <option style={{ fontSize: "0.8rem" }} value="satellite2">
          Satellite 2
        </option>
        <option style={{ fontSize: "0.8rem" }} value="satellite3">
          Satellite 3
        </option>
      </select>


        {/* Scrollable Index Buttons */}
        <div
          className="flex gap-2 flex-nowrap overflow-x-auto pr-10 scroll-smooth no-scrollbar"
          ref={scrollContainerRef}
        >
          {indices.map((index) => (
            <button
              key={index}
              className={`flex-shrink-0 rounded text-white font-medium px-4 py-2 text-sm h-[46px]
                sm:h-[44px] sm:px-3 sm:py-2
                ${selectedIndex === index ? "bg-[#344e41]" : "bg-[#5a7c6b] hover:bg-[#4a6b5a]"}`}
              onClick={() => {
                dispatch(removeSelectedIndexData());
                setSelectedIndex(index);
              }}
            >
              {index_name_mapping[index] || index}
            </button>
          ))}
        </div>

        {/* Scroll Right Arrow */}
        <button
          className="absolute right-2 bg-[#344e41] text-white p-2 rounded cursor-pointer z-10
                     sm:p-[6px] sm:right-1"
          onClick={handleArrowClick}
        >
          <GratterThan />
        </button>
      </div>
    </div>
  );
};

export default SatelliteIndexList;
