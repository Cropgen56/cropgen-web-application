import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";

import imgFrame280 from "../../../assets/image/Frame 280.png";
import imgGroup530 from "../../../assets/image/Group 530.png";
import imgGroup531 from "../../../assets/image/Group 531.png";

import {
  fetchActivities,
  generateActivities,
} from "../../../redux/slices/smartAdvisorySlice";

/* ================= WEEKLY CACHE ================= */

const ACTIVITY_CACHE_PREFIX = "activities_generated";
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

const getCacheKey = (farmerId, fieldId, advisoryId) =>
  `${ACTIVITY_CACHE_PREFIX}_${farmerId}_${fieldId}_${advisoryId}`;

/* ================= ICON ================= */

const ActivityIcon = ({ type }) => {
  switch (type) {
    case "IRRIGATION":
      return "💧";
    case "FERTILIZER":
      return "🌱";
    case "SPRAY":
      return "🧪";
    case "FERTILIZER_AVOIDED":
      return "❌🌱";
    case "SPRAY_AVOIDED":
      return "❌🧪";
    default:
      return "📌";
  }
};

export default function FarmAdvisoryCard({ selectedField }) {
  const dispatch = useDispatch();

  const generateRef = useRef(null);
  const fetchRef = useRef(null);

  const user = useSelector((s) => s.auth?.user);
  const advisory = useSelector((s) => s.smartAdvisory?.advisory);
  const { activities = [], activitiesLoading } = useSelector(
    (s) => s.smartAdvisory
  );

  const farmerId = user?.id;
  const fieldId = selectedField?._id;
  const advisoryId = advisory?._id;

  /* ================= NORMALIZE FIELD ID ================= */

  const advisoryFieldId =
    typeof advisory?.farmFieldId === "string"
      ? advisory?.farmFieldId
      : advisory?.farmFieldId?._id;

  /* ================= RESET ON CHANGE ================= */

  useEffect(() => {
    generateRef.current = null;
    fetchRef.current = null;
  }, [farmerId, fieldId, advisoryId]);

  /* ================= GENERATE (WEEKLY) ================= */

  useEffect(() => {
    if (!farmerId || !fieldId || !advisoryId) return;
    if (advisoryFieldId !== fieldId) return;

    const cacheKey = getCacheKey(farmerId, fieldId, advisoryId);
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const { timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ONE_WEEK) return;
    }

    if (generateRef.current === advisoryId) return;
    generateRef.current = advisoryId;

    dispatch(generateActivities({ farmerId, fieldId, advisoryId }))
      .unwrap()
      .then(() => {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now() })
        );
      })
      .catch(() => {});
  }, [dispatch, farmerId, fieldId, advisoryId, advisoryFieldId]);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!farmerId || !fieldId || !advisoryId) return;
    if (advisoryFieldId !== fieldId) return;

    if (fetchRef.current === advisoryId) return;
    fetchRef.current = advisoryId;

    dispatch(fetchActivities({ farmerId, fieldId, advisoryId }));
  }, [dispatch, farmerId, fieldId, advisoryId, advisoryFieldId]);

  /* ================= UI ================= */

  return (
    <div className="w-full bg-[#335343] rounded-t-xl overflow-hidden">
      <div className="px-6 py-4 text-white">
        <h2 className="text-[22px] font-semibold flex gap-3 items-center">
          <img src={imgFrame280} className="w-6 h-6" />
          Activities To Do
        </h2>
      </div>

      <div className="bg-white px-6 py-4">
        {activitiesLoading && <p>Loading activities…</p>}

        {!activitiesLoading && activities.length === 0 && (
          <p>No activities generated for this advisory.</p>
        )}

        {activities.map((a) => (
          <div key={a._id} className="flex gap-4 border-b py-3">
            <div className="text-xl">
              <ActivityIcon type={a.activityType} />
            </div>
            <div className="flex-1">
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-gray-600">{a.description}</p>
              <p className="text-xs text-gray-400">
                {new Date(a.targetDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-xs font-bold">
              {a.farmerDecision}
            </div>
          </div>
        ))}
      </div>

      {activities.length > 0 && (
        <div className="bg-white flex justify-center gap-4 py-4 border-t">
          <button
            onClick={() => message.success("Accepted (UI only)")}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            <img src={imgGroup531} className="inline w-5 h-5 mr-2" />
            Accept All
          </button>
          <button
            onClick={() => message.warning("Rejected (UI only)")}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            <img src={imgGroup530} className="inline w-5 h-5 mr-2" />
            Reject All
          </button>
        </div>
      )}
    </div>
  );
}
