import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FiInfo } from "react-icons/fi";
import { MdDownload } from "react-icons/md";

const sampleData = [
  { date: "Sep 03", day1: 0.35 },
  { date: "Sep 10", day1: 0.65 },
  { date: "Sep 17", day1: 0.5 },
  { date: "Sep 24", day1: 0.35 },
  { date: "Oct 01", day1: 0.5 },
  { date: "Oct 07", day1: 0.38 },
  { date: "Oct 14", day1: 0.46 },
  { date: "Oct 21", day1: 0.32 },
  { date: "Oct 28", day1: 0.5 },
  { date: "Nov 04", day1: 0.65 },
  { date: "Nov 11", day1: 0.6 },
  { date: "Nov 18", day1: 0.5 },
];

const NDVIChartCard = () => {
  return (
    <div className="w-full bg-[#2C4C3B] rounded-lg p-4 text-white">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Left: NDVI Info */}
        <div className="w-full md:w-1/3 flex flex-col gap-3">
          <h2 className="text-4xl font-bold text-[#86D72F]">NDVI</h2>
          <div className="bg-[#47664D] text-[#86D72F] px-4 py-2 rounded-md text-xl font-semibold w-fit">
            +0.15
          </div>
          <p className="text-sm text-gray-300">Last Update 4 days Ago</p>
          <div className="bg-[#365541] border border-gray-400 p-3 rounded-md flex gap-2 text-sm">
            <FiInfo className="mt-1 shrink-0" />
            <p>
              NDVI values can also be used to map and classify vegetation types, and to detect changes in vegetation cover over time.
            </p>
          </div>
        </div>

        {/* Right: Chart and Info Cards */}
        <div className="w-full md:w-2/3 flex flex-col gap-2">
          {/* Chart */}
          <div className="relative w-full">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={sampleData}>
                <CartesianGrid stroke="#3a5947" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#ccc" fontSize={12} />
                <YAxis stroke="#ccc" fontSize={12} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#47664D", border: "none", color: "white" }}
                  labelStyle={{ color: "white" }}
                  formatter={(value) => value.toFixed(2)}
                />
                <Line type="monotone" dataKey="day1" stroke="#86D72F" dot={{ r: 3 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            {/* Legend & Download */}
            <div className="absolute top-0 right-0 flex items-center gap-4 text-sm pr-4 pt-2">
              <span className="text-[#86D72F] font-semibold">● NDVI ( Day1 )</span>
              <MdDownload className="text-xl cursor-pointer" />
            </div>
          </div>

          {/* Compact Info Cards under Chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 rounded-md overflow-hidden text-[11px] leading-snug text-white">
            {/* Card 1 */}
            <div className="bg-[#5B7C6F] p-2 flex flex-col justify-between border-r border-[#3e5c4a]">
              <p className="font-semibold border-b border-[#3e5c4a]  mb-1 text-xs">
                Low NDVI in Specific Areas
              </p>
              <p className="pl-3">• Check for irrigation leaks, clogged drippers, or uneven fertilizer distribution.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#5B7C6F] p-2 flex flex-col justify-between border-r border-[#3e5c4a]">
              <p className="font-semibold border-b border-[#3e5c4a] pb-1 mb-1">
                Sudden NDVI Drops
              </p>
              <p className="pl-3">• Investigate pest outbreaks or extreme weather events like hailstorms or drought.</p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#5B7C6F] p-2 flex flex-col justify-between">
              <p className="font-semibold border-b border-[#3e5c4a] pb-1 mb-1">
                Consistently Low NDVI
              </p>
              <p className="pl-3">• May indicate soil fertility issues. Conduct soil tests for corrective measures.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NDVIChartCard;
