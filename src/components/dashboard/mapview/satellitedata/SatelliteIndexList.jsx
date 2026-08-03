import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIndexData,
  removeSelectedIndexData,
} from "../../../../redux/slices/satelliteSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DEFAULT_SATELLITE,
  getDefaultIndexForSatellite,
  getIndexMetaForSatellite,
  getIndicesForSatellite,
} from "../../../../constants/satelliteIndices";

const SatelliteIndexList = ({
  selectedFieldsDetials = [],
  selectedDate = null,
}) => {
  const dispatch = useDispatch();
  const selectedSatellite = useSelector(
    (state) => state.satellite.selectedSatellite || DEFAULT_SATELLITE,
  );
  const scrollContainerRef = useRef(null);

  const indices = useMemo(
    () => getIndicesForSatellite(selectedSatellite),
    [selectedSatellite],
  );
  const indexMeta = useMemo(
    () => getIndexMetaForSatellite(selectedSatellite),
    [selectedSatellite],
  );

  const [selectedIndex, setSelectedIndex] = useState(
    getDefaultIndexForSatellite(selectedSatellite),
  );

  useEffect(() => {
    const defaultIndex = getDefaultIndexForSatellite(selectedSatellite);
    setSelectedIndex(defaultIndex);
    dispatch(removeSelectedIndexData());
  }, [selectedSatellite, dispatch]);

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
          satellite: selectedSatellite,
        }),
      );
    },
    [selectedDate, coordinates, dispatch, selectedSatellite],
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
    coordinates,
    selectedSatellite,
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
              const meta = indexMeta[index];
              const isSelected = selectedIndex === index;

              return (
                <button
                  key={`${selectedSatellite}-${index}`}
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
          className="absolute right-2 bg-ember-sidebar text-white py-3 rounded cursor-pointer z-10 sm:right-1"
          onClick={handleArrowRightClick}
        >
          <ChevronRight size={24} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default SatelliteIndexList;
