import React from "react";
import { useSelector } from "react-redux";

/* ================= ICON MAP ================= */

const ACTIVITY_ICON = {
  SPRAY: "🧴",
  FERTIGATION: "🌿",
  IRRIGATION: "🚿",
  WEATHER: "🌦️",
  CROP_RISK: "⚠️",
  MONITORING: "👁️",
  CARBON_TRACKING: "🌍",
};

const formatAdvisoryDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* ================= ACTIVITY CARD ================= */

const ActivityCard = ({ activity }) => (
  <div className="flex gap-4 border-b py-3 last:border-b-0">
    <div className="text-xl">{ACTIVITY_ICON[activity.type] || "📌"}</div>

    <div className="flex-1">
      <p className="font-semibold text-gray-800">{activity.title}</p>

      <p className="text-sm text-gray-600 mt-1">{activity.message}</p>

      {activity.details && (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          {activity.details.chemical && (
            <div>🧴 {activity.details.chemical}</div>
          )}
          {activity.details.fertilizer && (
            <div>🌿 {activity.details.fertilizer}</div>
          )}
          {activity.details.quantity && (
            <div>📏 {activity.details.quantity}</div>
          )}
          {activity.details.method && <div>🚜 {activity.details.method}</div>}
          {activity.details.time && <div>⏰ {activity.details.time}</div>}
        </div>
      )}
    </div>
  </div>
);

/* ================= MAIN COMPONENT ================= */

export default function FarmAdvisoryCard() {
  const { advisory, loading } = useSelector(
    (state) => state.smartAdvisory || {},
  );

  const activities = advisory?.activitiesToDo || [];
  const advisoryDate = formatAdvisoryDate(advisory?.createdAt);

  return (
    <div className="w-full bg-[#335343] rounded-lg shadow-md border border-white/5 overflow-hidden">
      <div className="px-6 py-4 text-white flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Activities To Do</h2>
        {advisoryDate && (
          <span className="text-sm text-white/80" title="Advisory date">
            📅 {advisoryDate}
          </span>
        )}
      </div>

      <div className="bg-white px-6 py-4">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading advisory…</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No activities available for today.
          </p>
        ) : (
          activities.map((activity, idx) => (
            <ActivityCard key={`${activity.type}-${idx}`} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
}
