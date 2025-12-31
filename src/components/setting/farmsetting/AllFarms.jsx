import React, { useEffect, useState } from "react";
import {
  Plus,
  Sprout,
} from "lucide-react";

import { getFarmFields } from "../../../redux/slices/farmSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import PolygonPreview from "../../polygon/PolygonPreview";
import FarmSkeletonLoader from "../../Skeleton/FarmSkeletonLoader";

import mapLocation from "../../../assets/image/setting/map-location.svg";

const FarmCard = ({ farm, onClick, isSubscribed, index }) => (
  <div
    onClick={() => onClick(farm)}
    className="relative flex flex-col bg-white rounded-lg shadow-sm border border-[#344E41]/20 transition-all duration-300 ease-in-out hover:shadow-md hover:border-[#344E41]/40 overflow-hidden cursor-pointer"
  >
    {/* Header */}
    <div className="flex items-start justify-between px-3 py-2 bg-[#344E41]/5 border-b border-[#344E41]/10">
      <div className="text-left">
        <span className="block font-bold text-[#344E41] text-base leading-tight">
          {farm.fieldName}
        </span>
        <span className="block text-xs font-semibold text-[#344E41]/70 mt-0.5">
          {Number(farm.acre || 0).toFixed(2)} ha
        </span>
      </div>

      <div
        className={`px-2 py-1 rounded-full text-[10px] font-bold ${isSubscribed
            ? "bg-[#DAFFED] text-[#28C878] border border-[#28C878]/30"
            : "bg-[#FFDEDF] text-[#EC1C24] border border-[#EC1C24]/30"
          }`}
      >
        {isSubscribed ? "Subscribed" : "Unsubscribed"}
      </div>
    </div>

    {/* Map Preview */}
    <div className="flex-grow flex flex-col justify-center bg-gradient-to-b from-white to-[#344E41]/5 py-2">
      <div className="w-full h-20 flex items-center justify-center px-2">
        {farm.field && farm.field.length > 0 ? (
          <PolygonPreview coordinates={farm.field} />
        ) : (
          <span className="text-[#344E41]/30 text-xs font-medium">
            No Shape
          </span>
        )}
      </div>

      {/* Crop Info */}
      <div className="flex items-center gap-1.5 px-2 mt-2 bg-[#344E41]/5 mx-2 py-1.5 rounded-md border border-[#344E41]/10">
        <Sprout className="w-4 h-4 text-[#344E41]" />
        <span className="text-xs text-[#344E41] font-semibold">
          {farm.cropName || "N/A"}
        </span>
        <span className="text-[#344E41]/30">•</span>
        <span className="text-xs text-[#344E41]/80 font-medium">
          {farm.sowingDate
            ? new Date(farm.sowingDate).toLocaleDateString()
            : "No Date"}
        </span>
        <span className="text-[#344E41]/30">•</span>
        <span className="text-xs text-[#344E41]/80 font-medium">
          {farm.variety || "N/A"}
        </span>
      </div>
    </div>

    {/* Footer */}
    <div className="flex justify-between items-center bg-gradient-to-r from-[#344E41] to-[#4a6b5e] px-3 py-2">
      <span className="text-xs text-white font-semibold">
        ID: CROP-{String(index + 1).padStart(3, "0")}
      </span>
      <div className="bg-white/20 p-1 rounded-md hover:bg-white/30 transition-colors">
        <img
          src={mapLocation}
          alt="map-location"
          className="w-4 h-4 brightness-0 invert"
        />
      </div>
    </div>
  </div>
);

const AddNewFarmCard = ({ onClick }) => (
  <div
    className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg shadow-sm border border-[#000000]/20 text-center cursor-pointer transition-all duration-500 ease-in-out hover:bg-emerald-50 min-h-[180px]"
    onClick={onClick}
  >
    <Plus strokeWidth={1} className="w-16 h-16 text-[#9A9898]" />
    <span className="text-base font-bold text-[#9A9898]">Add New Farm</span>
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
    <div className="flex flex-col flex-grow gap-3 py-2 h-[calc(100vh-100px)]">
      {/* Tabs */}
      <div className="flex justify-start bg-[#E6F8EF] rounded-lg gap-1.5 py-1.5 px-2 w-fit">
        {["all", "subscribed", "unsubscribed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-500 ease-in-out ${activeTab === tab
                ? "bg-[#344E41] text-[#fff] border border-[#344E41] font-bold"
                : "text-black hover:text-[#344E41] font-semibold"
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
      <div className="overflow-y-auto flex-grow pr-1 mb-2 scroll-smooth no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-6">
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
    </div>
  );
};

export default AllFarms;