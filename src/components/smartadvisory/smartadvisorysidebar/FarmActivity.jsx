import React from "react";
import { useSelector } from "react-redux";

/* ================= ICON MAP ================= */

const ACTIVITY_ICON = {
  SPRAY: "🧪",
  FERTIGATION: "🌱",
  IRRIGATION: "💧",
  WEATHER: "🌦️",
  CROP_RISK: "⚠️"
};

/* ================= CARD ================= */

const ActivityCard = ({ activity }) => {
  return (
    <div className="flex gap-4 border-b py-3 last:border-b-0">
      <div className="text-xl">
        {ACTIVITY_ICON[activity.type] || "📌"}
      </div>

      <div className="flex-1">
        <p className="font-semibold text-gray-800">
          {activity.title}
        </p>

        <p className="text-sm text-gray-600 mt-1">
          {activity.message}
        </p>

        {/* DETAILS */}
        {activity.details && (
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            {activity.details.chemical && (
              <div>🧴 {activity.details.chemical}</div>
            )}
            {activity.details.fertilizer && (
              <div>🌱 {activity.details.fertilizer}</div>
            )}
            {activity.details.quantity && (
              <div>📏 {activity.details.quantity}</div>
            )}
            {activity.details.method && (
              <div>🚜 {activity.details.method}</div>
            )}
            {activity.details.time && (
              <div>⏰ {activity.details.time}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= MAIN ================= */

export default function FarmAdvisoryCard() {
  const { advisory, loading } = useSelector(
    (state) => state.smartAdvisory || {}
  );

  const activities = advisory?.activitiesToDo || [];

  /* ================= UI ================= */

  return (
    <div className="w-full bg-[#335343] rounded-t-xl overflow-hidden">
      <div className="px-6 py-4 text-white">
        <h2 className="text-lg font-semibold">
          Activities To Do
        </h2>
      </div>

      <div className="bg-white px-6 py-4">
        {loading ? (
          <p className="text-gray-500 text-sm">
            Loading advisory…
          </p>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No activities available for today.
          </p>
        ) : (
          activities.map((activity, idx) => (
            <ActivityCard
              key={`${activity.type}-${idx}`}
              activity={activity}
            />
          ))
        )}
      </div>
      {/* ================= ACTION BUTTONS ================= */}
{!loading && activities.length > 0 && (
  <div className="bg-white border-t px-6 py-4 flex justify-center gap-4">
    <button
      onClick={() => alert("All activities accepted")}
      className="bg-green-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition"
    >
      ✅ Accept All
    </button>

    <button
      onClick={() => alert("All activities rejected")}
      className="bg-red-500 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-red-600 transition"
    >
      ❌ Reject All
    </button>
  </div>
)}

    </div>
    
  );
}
