import React, { useState } from "react";
import { message } from "antd";

// Icon/image imports
import img1 from "../../../assets/image/Icon.png";
import img2 from "../../../assets/image/Frame 278.png";
import img3 from "../../../assets/image/3f4ad4d5b8.png";
import img4 from "../../../assets/image/Frame 266 (1).png";
import img5 from "../../../assets/image/fluent_weather-fog-24-filled.png";
import img6 from "../../../assets/image/Frame 280.png";
import img7 from "../../../assets/image/Frame 275.png";
import img8 from "../../../assets/image/Frame 276.png";
import img9 from "../../../assets/image/Frame 277.png";
import img10 from "../../../assets/image/Group 530.png"
import img11 from "../../../assets/image/Group 531.png"
// Initial tips with icons
const initialTips = [
  {
    icon: <img src={img1} alt="" />,
    text: "Increase irrigation in Field 2: Soil moisture at 22%",
    badge: <img src={img7} alt="" />,
  },
  {
    icon: <img src={img2} alt="" />,
    text: "Apply organic fertilizer in Field 3 (flowering stage)",
  },
  {
    icon: <img src={img3} alt="" />,
    text: "Schedule pesticide spraying tomorrow morning (low wind)",
    badge: <img src={img9} alt="" />,
  },
  {
    icon: <img src={img4} alt="" />,
    text: "Monitor NDVI drop in Field 1: possible stress",
  },
  {
    icon: <img src={img5} alt="" />,
    text: "Avoid spraying today due to high winds; plan for tomorrow morning (6–10 AM).",
    badge: <img src={img8} alt="" />,
  },
];

export default function FarmAdvisoryCard() {
  const [tips, setTips] = useState(
    initialTips.map((tip) => ({ ...tip, status: "pending" }))
  );

  const handleAcceptAll = () => {
    setTips((prev) => prev.map((tip) => ({ ...tip, status: "accepted" })));
    message.success("All tasks have been accepted!");
  };

  const handleRejectAll = () => {
    setTips((prev) => prev.map((tip) => ({ ...tip, status: "rejected" })));
    message.warning("All tasks have been rejected.");
  };

  return (
    <div className="w-full bg-[#335343] rounded-t-xl">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 text-white">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <img src={img6} alt="" />
          Activity to do
        </h2>
        <div className="flex items-center gap-4 text-white">
          <button
            title="Regenerate Tips"
            className="hover:opacity-80 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582M20 20v-5h-.581M4 9a9 9 0 0115.364-3.364M20 15a9 9 0 01-15.364 3.364"
              />
            </svg>
          </button>
          <button title="Download">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-white text-[#1a1a1a] px-6 py-4">
        <p className="font-semibold text-[15px] mb-4">
          Farm-Wide Tips for Today
        </p>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex justify-between items-start gap-4"
            >
              <div className="flex gap-3 items-start">
                <div className="pt-[2px]">{tip.icon}</div>
                <p className="text-[14px] leading-snug">
                  {tip.text}
                  {tip.status === "accepted" && (
                    <span className="ml-2 text-green-700 font-medium">
                      [Accepted]
                    </span>
                  )}
                  {tip.status === "rejected" && (
                    <span className="ml-2 text-red-600 font-medium">
                      [Rejected]
                    </span>
                  )}
                </p>
              </div>
              {tip.badge && <div className="pt-[2px]">{tip.badge}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white flex justify-center gap-2 items-center py-4">
        <button
          onClick={handleAcceptAll}
          className="text-white font-bold rounded-md px-4 py-2 hover:opacity-90"
        >
          <img src={img11} alt="" srcset="" />
        </button>
        <button
          onClick={handleRejectAll}
          className=" text-white font-bold rounded-md px-4 py-2 hover:opacity-90"
        >
         <img src={img10} alt="" srcset="" />
        </button>
      </div>
    </div>
  );
}
