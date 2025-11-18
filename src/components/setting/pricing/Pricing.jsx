import { ArrowLeft } from "lucide-react";
import React from "react";

const Pricing = ({ setShowSidebar }) => {
  return (
    <div className="max-w-[1200px] w-[98%] mx-auto my-2 p-2 lg:p-4 rounded-lg bg-white shadow-md h-[98%] flex flex-col box-border overflow-hidden overflow-y-hidden font-inter">
      <div className="flex items-center justify-between text-left px-4 py-1 border-b border-black/40 text-[#344E41]">
        <h5 className="font-bold">Pricing</h5>
        <button
          onClick={() => setShowSidebar(true)}
          className="flex items-center gap-1 text-sm text-[#344E41] hover:text-[#1d3039] transition-all duration-300 ease-in-out cursor-pointer"
        >
          <ArrowLeft size={18} /> Back to Settings
        </button>
      </div>
    </div>
  );
};

export default Pricing;
