import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

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
    <div className="w-full bg-white rounded-lg shadow-sm relative">
      {/* Selected Field Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#344e41]">
            {selectedField?.fieldName || "Select field"}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
              isSubscribed
                ? "bg-[#DAFFED] text-[#28C878]"
                : "bg-[#FFDEDF] text-[#EC1C24]"
            }`}
          >
            {isSubscribed ? "Active" : "Inactive"}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#344e41] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
            {sortedFields.map((field) => {
              const isSelected = field._id === selectedField?._id;
              const fieldSubscribed =
                field.subscription?.hasActiveSubscription === true;

              return (
                <div
                  key={field._id}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    isSelected ? "bg-[#344e41]/5" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleFieldSelect(field)}
                >
                  <span
                    className={`text-sm ${
                      isSelected
                        ? "font-medium text-[#344e41]"
                        : "text-gray-600"
                    }`}
                  >
                    {field.fieldName}
                  </span>
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