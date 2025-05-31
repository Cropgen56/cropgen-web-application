import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import "./SatelliteIndexList.css";
import { GratterThan } from "../../../../assets/Icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIndexData,
  removeSelectedIndexData,
} from "../../../../redux/slices/satelliteSlice";

// Mapping of indices to their display names
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

// Available indices for buttons
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
  const { indexData } = useSelector((state) => state?.satellite);
  const scrollContainerRef = useRef(null);

  // Memoize coordinates to prevent unnecessary reference changes
  const coordinates = useMemo(() => {
    const coords = field?.map(({ lat, lng }) => [lng, lat]) || [];
    return coords;
  }, [field]);

  // Debounce function to limit API calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Memoized fetch function
  const handleFetchIndex = useCallback(
    (index) => {
      if (!sowingDate || !selectedDate || !coordinates.length || !index) {
        return;
      }
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

  // Debounced version of handleFetchIndex
  const debouncedFetchIndex = useMemo(
    () => debounce(handleFetchIndex, 300),
    [handleFetchIndex]
  );

  // Effect to fetch data on index or date change
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

  // Handle arrow button click to scroll right
  const handleArrowClick = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="satellite-data-main-container">
      <div className="satellite-data-container">
        <select className="dropdown">
          <option value="satellite1">Satellite 1</option>
          <option value="satellite2">Satellite 2</option>
          <option value="satellite3">Satellite 3</option>
        </select>

        <div className="buttons-scroll-container" ref={scrollContainerRef}>
          {indices?.map((index) => (
            <button
              key={index}
              className={`button ${index.toLowerCase()}-btn ${
                selectedIndex === index ? "selected" : ""
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

        <button className="index-arrow-button" onClick={handleArrowClick}>
          <GratterThan />
        </button>
      </div>
    </div>
  );
};

export default SatelliteIndexList;
