import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { CheckCircle2, Circle, Loader2, PlayCircle } from "lucide-react";
import { updateAdvisoryActivityProgress } from "../../../redux/slices/smartAdvisorySlice";
import { getOperationsByFarmField } from "../../../redux/slices/operationSlice";
import ActivityDetails from "./ActivityDetails";

const ACTIVITY_ICON = {
  SPRAY: "🧴",
  FERTIGATION: "🌿",
  IRRIGATION: "🚿",
  WEATHER: "🌦️",
  CROP_RISK: "⚠️",
  MONITORING: "👁️",
  CARBON_TRACKING: "🌍",
};

const PROGRESS_OPTIONS = [
  {
    value: "started",
    label: "Started",
    icon: Circle,
    activeClass:
      "bg-[#0D6B45] text-white border-transparent shadow-lg shadow-[#0D6B45]/30",
    idleClass:
      "bg-[#214A37] text-white/60 border-transparent hover:bg-[#295742]",
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: PlayCircle,
    activeClass:
      "bg-[#48A36D] text-white border-transparent shadow-lg shadow-[#48A36D]/30",
    idleClass:
      "bg-[#214A37] text-white/60 border-transparent hover:bg-[#295742]",
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle2,
    activeClass:
      "bg-[#63C086] text-[#10271D] border-transparent shadow-lg shadow-[#63C086]/30",
    idleClass:
      "bg-[#214A37] text-white/60 border-transparent hover:bg-[#295742]",
  },
];

const formatAdvisoryDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ActivityCard = ({
  activity,
  isUpdating,
  onProgressChange,
}) => {
  const progress = activity.progress ?? null;

  return (
    <div
      className={`rounded-xl p-4 transition-all duration-300 ${
        progress === "completed"
          ? "bg-[#214A37]"
          : progress === "in_progress"
            ? "bg-[#1F4D38]"
            : "bg-[#173A2A]"
      }`}
    >
      <div className="flex gap-3">
        <div className="shrink-0 text-xl">
          {ACTIVITY_ICON[activity.type] || "📌"}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">{activity.title}</p>

          {activity.message ? (
            <p className="mt-1 text-sm leading-relaxed text-white/70">
              {activity.message}
            </p>
          ) : null}

          <ActivityDetails details={activity.details} />
        </div>
      </div>

      <div className="mt-4 border-t border-white/5 pt-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Track status
        </p>

        <div className="flex flex-wrap gap-2">
          {PROGRESS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = progress === opt.value;
            const loading = isUpdating && isActive;

            return (
              <button
                key={opt.value}
                type="button"
                disabled={isUpdating}
                onClick={() => onProgressChange(activity.type, opt.value)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-60 ${
                  isActive ? opt.activeClass : opt.idleClass
                }`}
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Icon size={14} />
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function FarmAdvisoryCard({ selectedField }) {
  const dispatch = useDispatch();

  const { advisory, loading, loadingFieldId, progressUpdating, progressError } =
    useSelector((state) => state.smartAdvisory || {});

  const advisoryFieldId =
    advisory?.farmFieldId?._id ?? advisory?.farmFieldId ?? null;
  const fieldMatches =
    !selectedField?._id ||
    !advisoryFieldId ||
    String(advisoryFieldId) === String(selectedField._id);

  const isLoadingForField =
    loading && loadingFieldId === selectedField?._id;

  const activities =
    fieldMatches && Array.isArray(advisory?.activitiesToDo)
      ? advisory.activitiesToDo
      : [];
  const advisoryDate = formatAdvisoryDate(advisory?.createdAt);

  const progressSummary = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(
      (activity) => activity.progress === "completed",
    ).length;
    const inProgress = activities.filter(
      (activity) => activity.progress === "in_progress",
    ).length;

    return { total, completed, inProgress };
  }, [activities]);

  const handleProgressChange = async (activityType, progress) => {
    if (!advisory?._id) {
      message.warning("No advisory loaded");
      return;
    }

    const current = activities.find((activity) => activity.type === activityType);
    if (current?.progress === progress) return;

    try {
      await dispatch(
        updateAdvisoryActivityProgress({
          advisoryId: advisory._id,
          activityType,
          progress,
        }),
      ).unwrap();

      const fieldId = selectedField?._id ?? advisoryFieldId;
      if (fieldId) {
        dispatch(getOperationsByFarmField({ farmId: fieldId }));
      }

      message.success("Progress updated — synced to Operations calendar");
    } catch (err) {
      message.error(
        typeof err === "string"
          ? err
          : progressError || "Could not update progress",
      );
    }
  };

  return (
    <div
      id="activities-to-do"
      className="w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#173A2A] via-[#1B3F2E] to-[#10271D] shadow-xl scroll-mt-24"
    >
      <div className="relative overflow-hidden px-6 py-4 text-white">
        <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-[#48A36D]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-14 h-44 w-44 rounded-full bg-[#0D6B45]/20 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">Activities To Do</h2>

          {advisoryDate && (
            <span className="rounded-lg bg-[#214A37]/80 px-3 py-1 text-sm text-white/80">
              📅 {advisoryDate}
            </span>
          )}
        </div>

        {activities.length > 0 && (
          <div className="relative mt-3 flex flex-wrap gap-2 text-[11px] font-medium">
            <span className="rounded-md bg-[#0D6B45]/70 px-2 py-1 text-white">
              {progressSummary.completed}/{progressSummary.total} completed
            </span>
            {progressSummary.inProgress > 0 && (
              <span className="rounded-md bg-[#48A36D]/25 px-2 py-1 text-[#CFE8D8]">
                {progressSummary.inProgress} in progress
              </span>
            )}
          </div>
        )}

        <p className="relative mt-2 text-[11px] text-white/50">
          Status updates appear on the Operations calendar for this field.
        </p>
      </div>

      <div className="space-y-3 bg-[#10271D] px-4 py-4 sm:px-6">
        {isLoadingForField ? (
          <p className="py-4 text-center text-sm text-white/60">
            Loading advisory…
          </p>
        ) : activities.length === 0 ? (
          <p className="py-4 text-center text-sm text-white/60">
            No activities available for today.
          </p>
        ) : (
          activities.map((activity) => (
            <ActivityCard
              key={activity.type}
              activity={activity}
              isUpdating={progressUpdating === activity.type}
              onProgressChange={handleProgressChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
