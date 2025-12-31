import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, RefreshCw, Calendar } from "lucide-react";

// Helper function for formatting dates
const formatDate = (date) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return String(date);
  }
};

// Custom Date Picker Component (Inline)
const CustomDatePickerInline = ({ value, onChange, placeholder, maxDate, minDate, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      return new Date(value).getMonth();
    }
    return new Date().getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    if (value) {
      return new Date(value).getFullYear();
    }
    return new Date().getFullYear();
  });
  const datePickerRef = useRef(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    const month = monthNames[date.getMonth()].slice(0, 3);
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const isDateDisabled = (day) => {
    const checkDate = new Date(currentYear, currentMonth, day);

    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(23, 59, 59, 999);
      if (checkDate > max) return true;
    }

    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (checkDate < min) return true;
    }

    return false;
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startDay = firstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-7 w-7"></div>);
    }

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
            h-7 w-7 rounded text-xs flex items-center justify-center
            transition-all duration-150
            ${isSelected
              ? 'bg-[#28C878] text-white font-bold'
              : isToday
                ? 'bg-[#5a7c6b] text-white'
                : isDisabled
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-white hover:bg-[#5a7c6b]'
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
    <div className="flex flex-col gap-1.5" ref={datePickerRef}>
      <label className="text-xs text-gray-300 font-medium">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-3 py-2.5 bg-[#2a3d33] text-white rounded-md
            border border-[#5a7c6b] outline-none
            flex items-center justify-between
            hover:bg-[#344e41] transition-all duration-200
            focus:ring-2 focus:ring-[#28C878] focus:border-transparent
            ${!value ? 'text-gray-400' : 'text-white'}
          `}
        >
          <span className="flex items-center gap-2">
            <Calendar size={14} className="text-[#28C878]" />
            <span className="truncate text-sm">
              {value ? formatDisplayDate(value) : placeholder}
            </span>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-[1400] w-60 mt-1 bg-[#344E41] border border-[#5a7c6b] rounded-lg shadow-xl p-3">
            <div className="flex items-center justify-between mb-3 text-white">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-[#5a7c6b] rounded transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-sm font-semibold">
                {monthNames[currentMonth].slice(0, 3)} {currentYear}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-[#5a7c6b] rounded transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={`${day}-${index}`} className="h-6 w-7 flex items-center justify-center text-xs text-gray-400 font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            <div className="mt-3 pt-2 border-t border-[#5a7c6b]">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                }}
                className="w-full py-1.5 text-xs text-white bg-[#5a7c6b] hover:bg-[#6b8d7c] rounded transition-colors"
              >
                Go to Today
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Date Range Picker Modal Component
const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onReset,
  onClose,
  isLoading,
}) => {
  const pickerRef = useRef(null);
  const today = new Date();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 bg-[#344e41] rounded-xl shadow-2xl border border-[#5a7c6b] p-4 z-[1300] min-w-[300px]"
      style={{ animation: "slideUp 0.2s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-[#28C878]" />
          <h3 className="text-white font-semibold text-sm">Select Date Range</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-[#5a7c6b] rounded"
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      {/* Date Pickers */}
      <div className="space-y-3">
        <CustomDatePickerInline
          label="Start Date"
          value={startDate}
          onChange={onStartDateChange}
          placeholder="Select start date"
          maxDate={endDate || today.toISOString().split('T')[0]}
        />

        <CustomDatePickerInline
          label="End Date"
          value={endDate}
          onChange={onEndDateChange}
          placeholder="Select end date"
          maxDate={today.toISOString().split('T')[0]}
          minDate={startDate}
        />
      </div>

      {/* Selected Range Display */}
      {startDate && endDate && (
        <div className="mt-3 p-2.5 bg-[#2a3d33] rounded-lg">
          <p className="text-[11px] text-gray-400 text-center">
            Selected Range:{" "}
            <span className="text-[#28C878] font-medium">
              {formatDate(startDate)}
            </span>
            {" → "}
            <span className="text-[#28C878] font-medium">
              {formatDate(endDate)}
            </span>
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-[#5a7c6b]">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#5a7c6b] hover:bg-[#6b8d7c] text-white text-sm rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          Reset
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={isLoading || !startDate || !endDate}
          className="flex-1 px-3 py-2.5 bg-[#28C878] hover:bg-[#22b06a] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-1.5">
              <RefreshCw size={14} className="animate-spin" />
              Loading...
            </span>
          ) : (
            "Apply"
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default DateRangePicker;