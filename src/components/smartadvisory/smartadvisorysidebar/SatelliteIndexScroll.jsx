import { useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

const indexOptions = [
  "NDVI", "EVI", "NDRE", "NDWI", "NDMI", "SAVI", "SMI", "SOC"
];

export default function SatelliteIndexScroll() {
  const containerRef = useRef(null);
  const currentIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToNext = () => {
    if (!containerRef.current) return;
    const newIndex = (currentIndexRef.current + 1) % indexOptions.length;
    currentIndexRef.current = newIndex;
    setActiveIndex(newIndex);
    const selected = containerRef.current.children[newIndex];
    if (selected) {
      selected.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const handleSelect = (index) => {
    currentIndexRef.current = index;
    setActiveIndex(index);
    const selected = containerRef.current.children[index];
    if (selected) {
      selected.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  return (
    <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-transparent">
      {/* Dropdown Label */}
      <div className="bg-[#5A7C6B] text-white font-semibold px-3 py-[6px] rounded-md text-[11px] shadow-sm">
        Satellite 1 ▾
      </div>

      {/* Scrollable Index Buttons */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto no-scrollbar space-x-2"
      >
        {indexOptions.map((label, index) => (
          <div
            key={index}
            onClick={() => handleSelect(index)}
            className={`min-w-[60px] px-3 py-[6px] text-[11px] font-bold uppercase rounded-md text-center cursor-pointer whitespace-nowrap transition-all
              ${index === activeIndex
                ? "bg-[#344E41] text-white shadow-[inset_0_0_6px_rgba(0,0,0,0.4)]"
                : "bg-[#5A7C6B] text-white shadow-sm"
              }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Right Arrow Button */}
      <button
        onClick={scrollToNext}
        className="bg-[#5A7C6B] hover:bg-[#6e9c83] transition-colors text-white p-1 rounded-md shadow-sm"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
