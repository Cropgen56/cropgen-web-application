import React, { useEffect, useState } from "react";
import {
  Wheat,
  Leaf,
  CalendarDays,
  Plus,
  Check,
  X,
  Sprout,
} from "lucide-react";
import { getFarmFields } from "../../../redux/slices/farmSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PolygonPreview from "../../polygon/PolygonPreview";
import FarmSkeletonLoader from "../../Skeleton/FarmSkeletonLoader";
import {
  checkFieldSubscriptionStatus,
  selectFieldSubscriptionStatus,
} from "../../../redux/slices/membershipSlice";
import mapLocation from "../../../assets/image/setting/map-location.svg";

const FarmCard = ({ farm, onClick, isSubscribed, index }) => (
  <div
    onClick={() => onClick(farm)}
    className="relative flex flex-col rounded-xl shadow-sm border-1 border-[#000000] text-center transition-shadow duration-500 ease-in-out hover:shadow-md overflow-hidden cursor-pointer"
  >
    <div className="flex items-start justify-between px-3 py-2">
      <div className="text-left">
        <span className="block font-semibold text-[#344E41] text-lg lg:text-xl leading-tight">
          {farm.fieldName}
        </span>
        <span className="block text-xs font-medium text-[#848484] mt-0.5">
          {Number(farm.acre || 0).toFixed(2)} hec
        </span>
      </div>

      <div
        className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
          isSubscribed
            ? "bg-[#DAFFED] text-[#28C878]"
            : "bg-[#FFDEDF] text-[#EC1C24]"
        }`}
      >
        {isSubscribed ? "Subscribed" : "Unsubscribed"}
      </div>
    </div>

    <div className="flex-grow flex flex-col justify-center bg-white py-2">
      <div className="w-full h-28 flex items-center justify-center">
        {farm.field && farm.field.length > 0 ? (
          <PolygonPreview coordinates={farm.field} />
        ) : (
          <span className="text-gray-400 text-sm">No Shape</span>
        )}
      </div>

      <div className="flex items-center gap-2 px-2 mt-4 text-left">
        <Sprout className="w-5 h-5 text-[#075A53]" />
        <span className="text-sm lg:text-sm text-black font-medium">
          {farm.cropName || "N/A"}
        </span>
        <span className="text-xs lg:text-sm text-black font-medium">
          {farm.sowingDate
            ? new Date(farm.sowingDate).toLocaleDateString()
            : "No Date"}
        </span>
        <span className="text-xs lg:text-sm text-black font-medium">
          {farm.variety || "N/A"}
        </span>
      </div>
    </div>

    <div className="flex justify-between items-center bg-white border-t border-[#075A53] p-3">
      <span className="text-base text-[#9A9898] font-semibold">
          Id: Crop-{String(index + 1).padStart(3, "0")}
      </span>

      <img
        src={mapLocation}
        alt="map-location"
        className="w-7 h-6 cursor-pointer"
      />
    </div>
  </div>
);

const AddNewFarmCard = ({ onClick }) => (
  <div
    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm border-1 border-[#000000] text-center cursor-pointer transition-all duration-500 ease-in-out hover:bg-emerald-50"
    onClick={onClick}
  >
    <Plus strokeWidth={1} className="w-24 h-24 text-[#9A9898]" />
    <span className="text-[20px] font-bold text-[#9A9898]">Add New Farm</span>
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

  // Get auth token for membership check
  const authToken = useSelector((state) => state.auth.token);

  // Get all field subscriptions from store
  const fieldSubscriptions = useSelector(
    (state) => state.membership.fieldSubscriptions || {}
  );

  // Get membership loading state
  const membershipLoading = useSelector((state) => state.membership.loading);

  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (status === "idle" && userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, status, userId]);

  // Check subscription status for each farm
  useEffect(() => {
    if (farms.length > 0 && authToken) {
      farms.forEach((farm) => {
        if (farm._id) {
          dispatch(
            checkFieldSubscriptionStatus({
              fieldId: farm._id,
              authToken,
            })
          );
        }
      });
    }
  }, [farms, authToken, dispatch]);

  if (status === "loading") return <FarmSkeletonLoader />;

  if (!userId)
    return (
      <p className="p-4 text-gray-500">Please log in to view your farms.</p>
    );

  if (status === "failed")
    return (
      <p className="p-4 text-red-600">
        {typeof error === "string"
          ? error
          : error?.message || "Something went wrong"}
      </p>
    );

  // Filter farms based on tab
  const filteredFarms = farms.filter((farm) => {
    const isSubscribed =
      fieldSubscriptions[farm._id]?.hasActiveSubscription || false;

    if (activeTab === "subscribed") return isSubscribed;
    if (activeTab === "unsubscribed") return !isSubscribed;
    return true;
  });

  return (
    <div className="flex flex-col flex-grow gap-4 py-2 h-[calc(100vh-100px)]">
      <div className="flex justify-start bg-[#E6F8EF] rounded-xl gap-2 py-2 px-3 w-fit">
        {["all", "subscribed", "unsubscribed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-base transition-all duration-500 ease-in-out ${
              activeTab === tab
                ? "bg-[#344E41] text-[#fff] border border-[#344E41] font-bold"
                : "text-black hover:text-[#344E41] font-semibold"
            }`}
          >
            {tab === "all"
              ? "All Farms"
              : tab === "subscribed"
              ? "Subscribed"
              : "UnSubscribed"}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto flex-grow pr-1 mb-2 scroll-smooth no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          <AddNewFarmCard onClick={() => navigate("/addfield")} />
          {filteredFarms.length > 0 ? (
            filteredFarms.map((farm, index) => {
              const isSubscribed =
                fieldSubscriptions[farm._id]?.hasActiveSubscription || false;

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
            <p className="text-gray-500 col-span-full text-center">
              No farms added yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllFarms;
