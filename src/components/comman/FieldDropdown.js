import React, { useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";

const FieldDropdown = ({ fields, selectedField, setSelectedField }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortedFields = [...fields].reverse();

  const isSubscribed =
    selectedField?.subscription?.hasActiveSubscription === true;

  const handleFieldSelect = (field) => {
    setSelectedField(field);
    setIsOpen(false);
  };

  return (
    <div className="w-[180px] relative z-[9000]">
      {/* Selected Field Header - Similar to SmartAdvisory button style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#344e41] text-white px-4 py-2.5 rounded-md shadow hover:bg-[#2d4339] transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "-rotate-90" : ""
            }`}
          />
          <span className="text-sm font-medium">
            {selectedField?.fieldName || "Select Farm"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isSubscribed ? "bg-[#28C878]" : "bg-[#EC1C24]"
            }`}
          />
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-20 max-h-40 overflow-y-auto border border-gray-200">
            {sortedFields.map((field) => {
              const isSelected = field._id === selectedField?._id;
              const fieldSubscribed =
                field.subscription?.hasActiveSubscription === true;

              return (
                <div
                  key={field._id}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                    isSelected
                      ? "bg-[#344e41] text-white"
                      : "hover:bg-[#344e41]/10 text-[#344e41]"
                  }`}
                  onClick={() => handleFieldSelect(field)}
                >
                  <span className="text-sm font-medium">{field.fieldName}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      fieldSubscribed ? "bg-[#28C878]" : "bg-[#EC1C24]"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default FieldDropdown;