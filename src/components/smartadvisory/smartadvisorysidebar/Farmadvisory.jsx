import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useSelector } from "react-redux";

import imgIcon from "../../../assets/image/Icon.png";
import imgFrame278 from "../../../assets/image/Frame 278.png";
import img3 from "../../../assets/image/3f4ad4d5b8.png";
import imgFrame280 from "../../../assets/image/Frame 280.png";
import imgGroup530 from "../../../assets/image/Group 530.png";
import imgGroup531 from "../../../assets/image/Group 531.png";

/* uploaded badge image available in conversation files */
const UPLOADED_IMAGE = "/mnt/data/92fc842d-fdcc-47c7-b2d4-2477640a1bc8.png";

export default function FarmAdvisoryCard() {
  const { advisory } = useSelector((state) => state.smartAdvisory || {});
  const weeklyItems = advisory?.smartAdvisory?.weeklyAdvisory?.items ?? [];

  const buildTipsFromWeekly = (items) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return items.map((it, idx) => ({
      id: `${it.key ?? "item"}_${idx}`,
      iconSrc: idx % 2 === 0 ? imgIcon : imgFrame278,
      text: it.advice ?? "No advice available",
      badgeSrc: it.key === "water" ? UPLOADED_IMAGE : null,
      status: "pending",
    }));
  };

  const fallbackTips = [
    {
      id: "fb_1",
      iconSrc: imgIcon,
      text: "Increase irrigation in Field 2: Soil moisture at 22%",
      status: "pending",
    },
    {
      id: "fb_2",
      iconSrc: imgFrame278,
      text: "Apply organic fertilizer in Field 3 (flowering stage)",
      status: "pending",
    },
    {
      id: "fb_3",
      iconSrc: img3,
      text: "Schedule pesticide spraying tomorrow morning (low wind)",
      status: "pending",
    },
  ];

  const [tips, setTips] = useState(
    buildTipsFromWeekly(weeklyItems) || fallbackTips
  );

  useEffect(() => {
    const newTips = buildTipsFromWeekly(weeklyItems);
    if (!newTips) return;
    setTips((prev) => {
      const map = new Map(prev.map((p) => [p.id, p.status]));
      return newTips.map((t) => ({ ...t, status: map.get(t.id) || "pending" }));
    });
  }, [weeklyItems]);

  const handleAcceptAll = () => {
    setTips((prev) => prev.map((t) => ({ ...t, status: "accepted" })));
    message.success("All tasks accepted");
  };

  const handleRejectAll = () => {
    setTips((prev) => prev.map((t) => ({ ...t, status: "rejected" })));
    message.warning("All tasks rejected");
  };

  return (
    <div className="w-full bg-[#335343] rounded-t-xl">
      <div className="flex justify-between items-center px-6 py-4 text-white">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <img src={imgFrame280} alt="activity" className="w-6 h-6" />
          Activity to do
        </h2>

        <div className="flex items-center gap-4 text-white">
          <button
            title="Regenerate Tips"
            className="hover:opacity-80 transition"
            onClick={() => message.info("Regenerate not implemented")}
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
          <button
            title="Download"
            onClick={() => message.info("Download not implemented")}
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
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white text-[#1a1a1a] px-6 py-4">
        <p className="font-semibold text-[15px] mb-4">
          Farm-Wide Tips for Today
        </p>
        <div className="space-y-4">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="flex justify-between items-start gap-4"
            >
              <div className="flex gap-3 items-start">
                <div className="pt-[2px]">
                  <img src={tip.iconSrc} alt="icon" className="w-6 h-6" />
                </div>

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

            </div>
          ))}
        </div>
      </div>

      <div className="bg-white flex justify-center gap-2 items-center py-4">
        <button
          onClick={handleAcceptAll}
          className="text-white font-bold rounded-md px-4 py-2 hover:opacity-90 bg-green-600"
        >
          <img
            src={imgGroup531}
            alt="accept"
            className="inline-block w-5 h-5"
          />
          <span className="ml-2">Accept All</span>
        </button>

        <button
          onClick={handleRejectAll}
          className="text-white font-bold rounded-md px-4 py-2 hover:opacity-90 bg-red-500"
        >
          <img
            src={imgGroup530}
            alt="reject"
            className="inline-block w-5 h-5"
          />
          <span className="ml-2">Reject All</span>
        </button>
      </div>
    </div>
  );
}
