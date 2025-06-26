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
    return field?.map(({ lat, lng }) => [lng, lat]) || [];
  }, [field]);

  const debounce = (func, wait) => {
    let timeout;
    const debounced = (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
    debounced.cancel = () => clearTimeout(timeout);
    return debounced;
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
    return () => debouncedFetchIndex.cancel();
  }, [
    selectedIndex,
    selectedDate,
    sowingDate,
    coordinates,
    debouncedFetchIndex,
    dispatch,
  ]);

  const handleArrowClick = () => {
    scrollContainerRef.current?.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-[99%] mx-auto my-1 shadow-md overflow-hidden bg-white">
      <div className="flex items-center gap-2 p-2 relative">
        <select className="flex-shrink-0 px-2 py-1 text-sm font-semibold bg-[#5a7c6b] text-white rounded border border-gray-300 min-w-[120px] focus:outline-none">
          <option value="satellite1">Satellite 1</option>
          <option value="satellite2">Satellite 2</option>
          <option value="satellite3">Satellite 3</option>
        </select>

        <div
          className="flex gap-2 overflow-x-auto pr-10 no-scrollbar scroll-smooth"
          ref={scrollContainerRef}
        >
          {indices.map((index) => (
            <button
              key={index}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded transition-colors ${
                selectedIndex === index
                  ? "bg-[#344e41] text-white"
                  : "bg-[#5a7c6b] text-white hover:bg-[#4a6b5a]"
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

        <button
          className="absolute right-2 p-2 rounded bg-[#344e41] text-white hover:bg-[#344e41]"
          onClick={handleArrowClick}
        >
          <GratterThan />
        </button>
      </div>
    </div>
  );
};

export default SatelliteIndexList;
