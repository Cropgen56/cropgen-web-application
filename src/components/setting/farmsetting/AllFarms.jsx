import React, { useEffect } from "react";
import { Wheat, Leaf, CalendarDays, Plus, Check, X } from "lucide-react";
import { getFarmFields } from "../../../redux/slices/farmSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PolygonPreview from "../../polygon/PolygonPreview";
import FarmSkeletonLoader from "../../Skeleton/FarmSkeletonLoader";
import { 
  checkFieldSubscriptionStatus, 
  selectFieldSubscriptionStatus 
} from "../../../redux/slices/membershipSlice";

const FarmCard = ({ farm, onClick, isSubscribed }) => (
  <div 
    onClick={() => onClick(farm)} 
    className="relative flex flex-col rounded-lg shadow-sm border-1 border-[#075A53] text-center transition-shadow duration-400 ease-in-out hover:shadow-md overflow-hidden cursor-pointer"
  >
    {/* Subscription Status Badge */}
    <div 
      className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg ${
        isSubscribed 
          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-400' 
          : 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400'
      }`}
    >
      {isSubscribed ? (
        <>

          <span>Subscribed</span>
        </>
      ) : (
        <>
          <span>Unsubscribed</span>
        </>
      )}
    </div>

    <div className="flex justify-between items-center bg-[#5A7C6B] text-white p-1.5 lg:p-3 rounded-t-lg">
      <span className="font-medium text-sm lg:text-base">{farm.fieldName}</span>
      <span className="font-medium text-xs lg:text-sm">
        {Number(farm.acre || 0).toFixed(2)} hec
      </span>
    </div>

    <div className="flex-grow flex items-center justify-center bg-white p-4">
      {farm.field && farm.field.length > 0 ? (
        <PolygonPreview coordinates={farm.field} />
      ) : (
        <span className="text-gray-400 text-sm">No Shape</span>
      )}
    </div>

    <div className="flex justify-around items-center bg-white border-t border-[#075A53] p-1.5 lg:p-3">
      <div className="flex flex-col items-center gap-1 text-[10px] lg:text-xs text-gray-900">
        <Leaf className="w-4 h-4 text-[#075A53]" />
        <span>{farm.variety || "N/A"}</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-[10px] lg:text-xs text-gray-900">
        <CalendarDays className="w-4 h-4 text-[#075A53]" />
        <span>
          {farm.sowingDate
            ? new Date(farm.sowingDate).toLocaleDateString()
            : "No Date"}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 text-[10px] lg:text-xs text-gray-900">
        <Wheat className="w-4 h-4 text-[#075A53]" />
        <span>{farm.cropName || "N/A"}</span>
      </div>
    </div>
  </div>
);

const AddNewFarmCard = ({ onClick }) => (
  <div 
    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm border-1 border-[#075A53] text-center cursor-pointer transition-shadow hover:shadow-md hover:bg-emerald-50" 
    onClick={onClick}
  >
    <Plus strokeWidth={1} className="w-24 h-24 text-[#FCC21B]" />
    <span className="font-semibold text-[#075A53]">Add New Farm</span>
  </div>
);

const AllFarms = ({ onAddFarmClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { 
    fields: farms, 
    status, 
    error 
  } = useSelector((state) => state.farmfield || { fields: [] });

  const user = useSelector((state) => state.auth.user);
  const userId = user?._id || user?.id;
  
  // Get auth token for membership check
  const authToken = useSelector((state) => state.auth.token);

  // Get all field subscriptions from store
  const fieldSubscriptions = useSelector((state) => state.membership.fieldSubscriptions || {});

  // Get membership loading state
  const membershipLoading = useSelector((state) => state.membership.loading);

  useEffect(() => {
    if (status === "idle" && userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, status, userId]);

  // Check subscription status for each farm
  useEffect(() => {
    if (farms.length > 0 && authToken) {
      farms.forEach(farm => {
        if (farm._id) {
          dispatch(checkFieldSubscriptionStatus({ 
            fieldId: farm._id, 
            authToken 
          }));
        }
      });
    }
  }, [farms, authToken, dispatch]);

  if (status === "loading") return <FarmSkeletonLoader />;

  if (!userId) 
    return <p className="p-4 text-gray-500">Please log in to view your farms.</p>;

  if (status === "failed") 
    return (
      <p className="p-4 text-red-600">
        {typeof error === "string" ? error : error?.message || "Something went wrong"}
      </p>
    );

  return (
    <div className="flex flex-col flex-grow gap-4 p-2 h-[calc(100vh-100px)]">
      <div className="overflow-y-auto flex-grow pr-1 mb-2 scroll-smooth no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {farms.length > 0 ? (
            farms.map((farm, index) => {
              // Get subscription status for this farm from the already fetched subscriptions
              const isSubscribed = fieldSubscriptions[farm._id]?.hasActiveSubscription || false;
              
              return (
                <FarmCard 
                  key={farm._id || index} 
                  farm={farm} 
                  onClick={onAddFarmClick}
                  isSubscribed={isSubscribed}
                />
              );
            })
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No farms added yet.
            </p>
          )}
          <AddNewFarmCard onClick={() => navigate("/addfield")} />
        </div>
      </div>
    </div>
  );
};

export default AllFarms;