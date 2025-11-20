import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react";


// Custom Date Picker Component
const CustomDatePicker = ({ label, value, onChange, placeholder, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const datePickerRef = useRef(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateSelect = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isDateDisabled = (day) => {
    if (!maxDate) return false;
    const checkDate = new Date(currentYear, currentMonth, day);
    return checkDate > maxDate;
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startDay = firstDayOfMonth(currentMonth, currentYear);
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-6"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = value && 
        new Date(value).getDate() === day &&
        new Date(value).getMonth() === currentMonth &&
        new Date(value).getFullYear() === currentYear;
      
      const isDisabled = isDateDisabled(day);
      const isToday = 
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth &&
        new Date().getFullYear() === currentYear;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateSelect(day)}
          disabled={isDisabled}
          className={`
            h-6 w-6 rounded text-xs flex items-center justify-center
            transition-all duration-150
            ${isSelected 
              ? 'bg-white text-[#344E41] font-bold' 
              : isToday
              ? 'bg-[#4a6b5a] text-white'
              : isDisabled
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-white hover:bg-[#2b3e33]'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="flex flex-col gap-1" ref={datePickerRef}>
      <label className="font-semibold text-sm">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2 bg-[#344E41] text-white rounded
            border border-[#344e41] outline-none
            flex items-center justify-between
            hover:bg-[#2b3e33] transition-all duration-200
            focus:ring-2 focus:ring-[#344e41] focus:ring-opacity-50
            ${!value ? 'text-gray-300' : 'text-white'}
          `}
        >
          <span className="flex items-center gap-2">
            <Calendar size={14} />
            <span className="truncate text-sm">
              {value ? formatDisplayDate(value) : placeholder}
            </span>
          </span>
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Date Picker Calendar - Compact */}
        {isOpen && (
          <div className="absolute z-50 w-56 mt-1 bg-[#344E41] border border-[#2b3e33] rounded shadow-lg p-2">
            {/* Month/Year Navigation */}
            <div className="flex items-center justify-between mb-2 text-white">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-0.5 hover:bg-[#2b3e33] rounded transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-xs font-semibold">
                {monthNames[currentMonth].slice(0, 3)} {currentYear}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-0.5 hover:bg-[#2b3e33] rounded transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Days of Week Headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`${day}-${index}`} className="h-5 w-6 flex items-center justify-center text-xs text-gray-300">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0.5">
              {renderCalendar()}
            </div>

            {/* Today Button */}
            <div className="mt-2 pt-2 border-t border-[#2b3e33]">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                  handleDateSelect(today.getDate());
                }}
                className="w-full py-1 text-xs text-white bg-[#2b3e33] hover:bg-[#253429] rounded transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDatePicker;
