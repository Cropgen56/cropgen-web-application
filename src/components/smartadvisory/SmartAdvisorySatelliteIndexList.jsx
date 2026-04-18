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

/** Same labels / hints / icons as dashboard `SatelliteIndexList` (biodrops-aligned). */
const index_name_mapping = {
  TRUE_COLOR: {
    label: "Field View",
    hint: "See anytime",
    icon: "📸",
  },
  NDVI: {
    label: "Crop Health",
    hint: "Weekly check",
    icon: "🌿",
  },
  EVI: {
    label: "Crop Health (Dense)",
    hint: "Thick crops",
    icon: "🌿",
  },
  EVI2: {
    label: "Crop Health (Simple)",
    hint: "Quick check",
    icon: "🌿",
  },
  SAVI: {
    label: "Early Stage Health",
    hint: "Just sowed",
    icon: "🌱",
  },
  MSAVI: {
    label: "Dry Land Health",
    hint: "Dry / sparse field",
    icon: "🏜️",
  },
  NDMI: {
    label: "Water in Leaves",
    hint: "Check irrigation",
    icon: "💧",
  },
  NDWI: {
    label: "Plant Water Level",
    hint: "Plant thirst",
    icon: "🪣",
  },
  SMI: {
    label: "Soil Moisture",
    hint: "Before watering",
    icon: "🌍",
  },
  CCC: {
    label: "Leaf Greenness",
    hint: "Nutrient check",
    icon: "🍃",
  },
  NITROGEN: {
    label: "Nitrogen Level",
    hint: "Before fertilizing",
    icon: "🧪",
  },
  SOC: {
    label: "Soil Fertility",
    hint: "Soil audit",
    icon: "🪱",
  },
  NDRE: {
    label: "Crop Stress / Maturity",
    hint: "Disease / Harvest",
    icon: "⚠️",
  },
  RECI: {
    label: "Leaf Richness",
    hint: "Mid-late season",
    icon: "🌾",
  },
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
    let coords = field.map(({ lat, lng }) => [lng, lat]);
    if (!validateGeometry(field)) {
      coords = [...coords, coords[0]];
    }
    return coords;
  }, [selectedFieldsDetials]);

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
      if (!selectedDate || !coordinates.length || !index) return;
      dispatch(
        fetchIndexData({
          endDate: selectedDate,
          geometry: [coordinates],
          index,
        }),
      );
    },
    [selectedDate, coordinates, dispatch],
  );

  const debouncedFetchIndex = useMemo(
    () => debounce(handleFetchIndex, 300),
    [handleFetchIndex],
  );

  useEffect(() => {
    dispatch(removeSelectedIndexData());
    debouncedFetchIndex(selectedIndex);
    return () => {
      debouncedFetchIndex.cancel?.();
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
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const handleArrowLeftClick = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full mx-auto my-1 shadow-md overflow-hidden">
      <div className="flex items-center gap-1 lg:gap-2 p-1 lg:p-2 relative">
        <button
          type="button"
          className="absolute left-2 lg:left-4 bg-ember-sidebar py-2.5 text-white rounded cursor-pointer z-10"
          onClick={handleArrowLeftClick}
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>

        <div className="relative flex-1 overflow-hidden px-[40px]">
          <div
            className="flex gap-1 lg:gap-2 flex-nowrap overflow-x-auto scroll-smooth no-scrollbar"
            ref={scrollContainerRef}
          >
            {indices.map((index) => {
              const meta = index_name_mapping[index];
              const isSelected = selectedIndex === index;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    dispatch(removeSelectedIndexData());
                    setSelectedIndex(index);
                  }}
                  className={`
                    flex-shrink-0 rounded text-white font-medium
                    px-3 py-1.5 text-xs lg:text-sm
                    flex flex-col items-center justify-center gap-0.5
                    min-w-[110px] h-[58px]
                    transition-all duration-300 ease-in-out
                    border-b-2
                    ${
                      isSelected
                        ? "bg-ember-sidebar brightness-75 border-white/60 shadow-inner"
                        : "bg-ember-surface hover:bg-ember-surface-muted border-transparent hover:brightness-90"
                    }
                  `}
                >
                  <span className="text-base leading-none">{meta?.icon}</span>
                  <span className="leading-tight text-center text-[11px] lg:text-xs font-semibold whitespace-nowrap">
                    {meta?.label || index}
                  </span>
                  <span
                    className={`text-[9px] lg:text-[10px] leading-none whitespace-nowrap font-normal
                      ${isSelected ? "text-white/80" : "text-white/50"}
                    `}
                  >
                    {meta?.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="absolute right-2 bg-ember-sidebar text-white py-3 rounded cursor-pointer z-10 sm:right-1"
          onClick={handleArrowRightClick}
        >
          <ChevronRight size={24} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default SmartAdvisorySatelliteIndexList;
