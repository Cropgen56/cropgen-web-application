import React, { useEffect, useState } from "react";
import {
  Plus,
  Sprout,
  Crown,
  RefreshCw,
} from "lucide-react";

import { getFarmFields } from "../../../redux/slices/farmSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import PolygonPreview from "../../polygon/PolygonPreview";
import SubscriptionStatusBadge from "../../comman/SubscriptionStatusBadge";
import FarmSkeletonLoader from "../../Skeleton/FarmSkeletonLoader";
import PricingOverlay from "../../pricing/PricingOverlay";
import { describeFarmPlan } from "../../../utils/farmPlan";

import mapLocation from "../../../assets/image/setting/map-location.svg";

const FarmCard = ({ farm, onClick, onChangePlan, isSubscribed, index }) => {
  const plan = describeFarmPlan(farm);
  // Multi-crop: `farm.crops` also carries harvested/retired history — only
  // the active instances describe what is on the farm right now.
  const activeCrops = Array.isArray(farm.crops)
    ? farm.crops.filter((crop) => crop.isActive !== false)
    : [];

  return (
  <div
    onClick={() => onClick(farm)}
    className="group relative flex flex-col bg-white rounded-2xl shadow-md border border-[#344E41]/15 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-[#344E41]/40 overflow-hidden cursor-pointer"
  >
    {/* Header */}
    <div className="flex items-start justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[#344E41]/10 to-[#344E41]/[0.03] border-b border-[#344E41]/10 min-w-0">
      <div className="text-left min-w-0 flex-1">
        <span className="block font-bold text-[#344E41] text-lg leading-tight truncate">
          {farm.fieldName}
        </span>
        <span className="block text-sm font-semibold text-[#344E41]/70 mt-0.5">
          {(Number(farm.acre || 0) * 0.404686).toFixed(2)} ha
        </span>
      </div>

      <SubscriptionStatusBadge isSubscribed={isSubscribed} className="self-center" />
    </div>

    {/* Map Preview */}
    <div className="flex-grow flex flex-col justify-center bg-gradient-to-b from-white to-[#344E41]/5 py-3">
      <div className="w-full h-24 flex items-center justify-center px-3 transition-transform duration-300 group-hover:scale-105">
        {farm.field && farm.field.length > 0 ? (
          <PolygonPreview coordinates={farm.field} />
        ) : (
          <span className="text-[#344E41]/30 text-xs font-medium">
            No Shape
          </span>
        )}
      </div>

      {/* Crop Info */}
      {activeCrops.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 px-2.5 mt-2 bg-[#344E41]/5 mx-3 py-2 rounded-lg border border-[#344E41]/10">
          <Sprout className="w-4 h-4 text-[#344E41] flex-shrink-0" />
          {activeCrops.slice(0, 2).map((crop) => (
            <span
              key={crop._id}
              className="text-xs text-[#344E41] font-semibold bg-white/70 rounded px-1.5 py-0.5"
            >
              {crop.cropName}
            </span>
          ))}
          {activeCrops.length > 2 && (
            <span className="text-xs text-[#344E41]/70 font-medium">
              +{activeCrops.length - 2} more
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5 px-2.5 mt-2 bg-[#344E41]/5 mx-3 py-2 rounded-lg border border-[#344E41]/10">
          <Sprout className="w-4 h-4 text-[#344E41]" />
          <span className="text-xs text-[#344E41] font-semibold">
            {farm.cropName || "N/A"}
          </span>
          <span className="text-[#344E41]/30">•</span>
          <span className="text-xs text-[#344E41]/80 font-medium">
            {farm.isBarrenLand
              ? "Barren · awaiting sowing"
              : farm.sowingDate
                ? new Date(farm.sowingDate).toLocaleDateString()
                : "No Date"}
          </span>
          <span className="text-[#344E41]/30">•</span>
          <span className="text-xs text-[#344E41]/80 font-medium">
            {farm.variety || "N/A"}
          </span>
        </div>
      )}
    </div>

    {/* Subscription: which plan this farm is on, and a way to change it */}
    <div
      className="flex items-center justify-between gap-2 border-t border-[#344E41]/10 bg-white px-4 py-2.5 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#344E41]/60">
          <Crown size={11} aria-hidden /> Subscription
        </p>
        <p
          className="truncate text-sm font-bold text-[#344E41]"
          title={plan.title}
        >
          {plan.title}
        </p>
        <p className="truncate text-xs text-gray-500" title={plan.detail}>
          {plan.detail}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onChangePlan?.(farm)}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#344E41]/30 bg-[#344E41]/5 px-2.5 py-1.5 text-xs font-semibold text-[#344E41] transition hover:bg-[#344E41] hover:text-white"
      >
        {plan.hasPlan ? <RefreshCw size={12} aria-hidden /> : null}
        {plan.hasPlan ? "Change plan" : "Subscribe"}
      </button>
    </div>

    {/* Footer */}
    <div className="flex justify-between items-center bg-gradient-to-r from-[#243d31] via-[#344E41] to-[#4a6b5e] px-4 py-2.5">
      <span className="text-xs text-white font-semibold">
        ID: CROP-{String(index + 1).padStart(3, "0")}
      </span>
      <div className="bg-white/20 p-1.5 rounded-lg hover:bg-white/30 transition-colors">
        <img
          src={mapLocation}
          alt="map-location"
          className="w-4 h-4 brightness-0 invert"
        />
      </div>
    </div>
  </div>
  );
};

const AddNewFarmCard = ({ onClick }) => (
  <div
    className="group flex flex-col items-center justify-center gap-1 p-4 bg-white/70 rounded-2xl border-2 border-dashed border-[#344E41]/25 text-center cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#344E41]/60 hover:bg-emerald-50 hover:shadow-lg min-h-[220px]"
    onClick={onClick}
  >
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#344E41]/10 text-[#344E41] transition-colors group-hover:bg-[#344E41] group-hover:text-white">
      <Plus strokeWidth={1.75} className="w-9 h-9" />
    </span>
    <span className="mt-1 text-base font-bold text-[#344E41]/70 group-hover:text-[#344E41]">Add New Farm</span>
  </div>
);

const AllFarms = ({ onAddFarmClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    fields: farms,
    status,
    error,
  } = useSelector((state) => state.farmfield || { fields: [] });

  const user = useSelector((state) => state.auth.user);
  const userId = user?._id || user?.id;

  const [activeTab, setActiveTab] = useState("all");
  /** Farm whose plan is being changed (opens the pricing dialog). */
  const [planFarm, setPlanFarm] = useState(null);

  useEffect(() => {
    if (status === "idle" && userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, status, userId]);

  if (status === "loading") return <FarmSkeletonLoader />;

  if (!userId)
    return (
      <p className="p-3 text-sm text-gray-500">Please log in to view your farms.</p>
    );

  if (status === "failed")
    return (
      <p className="p-3 text-sm text-red-600">
        {typeof error === "string"
          ? error
          : error?.message || "Something went wrong"}
      </p>
    );

  const filteredFarms = farms.filter((farm) => {
    const isSubscribed = farm?.subscription?.hasActiveSubscription;

    if (activeTab === "subscribed") return isSubscribed;
    if (activeTab === "unsubscribed") return !isSubscribed;
    return true;
  });

  const sortedFarms = [...filteredFarms].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="flex min-h-0 flex-col gap-3">
      {/* Tabs */}
      <div className="flex flex-wrap justify-start bg-[#E6F8EF] rounded-xl gap-1 p-1.5 sm:gap-1.5 w-fit max-w-full shadow-inner">
        {["all", "subscribed", "unsubscribed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ease-in-out sm:px-4 sm:text-sm ${activeTab === tab
                ? "bg-[#344E41] text-[#fff] border border-[#344E41] font-bold shadow-md"
                : "text-black hover:text-[#344E41]"
              }`}
          >
            {tab === "all"
              ? "All Farms"
              : tab === "subscribed"
                ? "Subscribed"
                : "Unsubscribed"}
          </button>
        ))}
      </div>

      {/* Farms List */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 scroll-smooth scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6 pt-1">
          <AddNewFarmCard onClick={() => navigate("/addfield")} />

          {sortedFarms.length > 0 ? (
            sortedFarms.map((farm, index) => {
              const isSubscribed =
                farm?.subscription?.hasActiveSubscription || false;

              return (
                <FarmCard
                  key={farm._id || index}
                  farm={farm}
                  onClick={onAddFarmClick}
                  onChangePlan={setPlanFarm}
                  isSubscribed={isSubscribed}
                  index={index}
                />
              );
            })
          ) : (
            <p className="text-gray-500 text-sm col-span-full text-center">
              No farms added yet.
            </p>
          )}
        </div>
      </div>

      {planFarm ? (
        <PricingOverlay
          onClose={() => setPlanFarm(null)}
          selectedField={{
            id: planFarm._id,
            _id: planFarm._id,
            fieldName: planFarm.fieldName,
            cropName: planFarm.cropName,
            acre: planFarm.acre,
            subscription: planFarm.subscription || null,
          }}
        />
      ) : null}
    </div>
  );
};

export default AllFarms;