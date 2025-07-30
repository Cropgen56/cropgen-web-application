import React, { useEffect } from "react";
import { PlusCircle, Wheat, Leaf, CalendarDays, Plus } from "lucide-react";
import FarmArea from "../../../assets/image/setting/farmarea.svg";
import { getFarmFields } from "../../../redux/slices/farmSlice";
import { useDispatch, useSelector } from "react-redux";

const FarmCard = ({ farm }) => (
  <div className="flex flex-col rounded-lg shadow-sm border-1 border-[#075A53] text-center transition-shadow hover:shadow-md overflow-hidden">
    <div className="flex justify-between items-center bg-[#5A7C6B] text-white p-3 rounded-t-lg">
      <span className="font-medium text-base">{farm.fieldName}</span>
      <span className="font-medium text-sm">
        {" "}
        {Number(farm.acre || 0).toFixed(2)} hec{" "}
      </span>
    </div>

    <div className="flex-grow flex items-center justify-center bg-white p-4">
      <img
        src={FarmArea}
        alt="FarmArea"
        className="max-w-[120px] max-h-[80px]"
      />
    </div>

    <div className="flex justify-around items-center bg-white border-t border-[#075A53] p-3">
      <div className="flex flex-col items-center gap-1 text-xs text-gray-900">
        <Leaf className="w-4 h-4 text-[#075A53]" />
        <span>{farm.variety || "N/A"}</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-xs text-gray-900">
        <CalendarDays className="w-4 h-4 text-[#075A53]" />
        <span>
          {farm.sowingDate
            ? new Date(farm.sowingDate).toLocaleDateString()
            : "No Date"}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1 text-xs text-gray-900">
        <Wheat className="w-4 h-4 text-[#075A53]" />
        <span>{farm.cropName || "N/A"}</span>
      </div>
    </div>
  </div>
);

const AddNewFarmCard = ({ onClick }) => (
  <div
    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm border-1 border-[#075A53] text-center cursor-pointer transition-shadow hover:shadow-md hover:bg-emerald-50"
    onClick={onClick} >
    <Plus strokeWidth={1} className="w-24 h-24 text-[#FCC21B]" />
    <span className="font-semibold text-[#075A53]">Add New Farm</span>
  </div>
);

const AllFarms = ({ onAddFarmClick }) => {
 
  const dispatch = useDispatch();
  const {
    fields: farms,
    status,
    error,
  } = useSelector((state) => state.farmfield || { fields: [] });

  const user = useSelector((state) => state.auth.user);
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (status === "idle" && userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, status, userId]);

  if (status === "loading") return <p className="p-4 text-gray-500">Loading farms...</p>;
  if (!userId) {
    return (
      <p className="p-4 text-gray-500">Please log in to view your farms.</p>
    );
  }
  if (status === "failed")
    return <p className="p-4 text-red-600">Error: {error}</p>;

  return (
    <div className="flex flex-col flex-grow gap-4 p-2">
      <div className="overflow-y-auto max-h-[calc(100vh-160px)] pr-1 mb-4 scroll-smooth no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.length > 0 ? (
            farms.map((farm, index) => (
              <FarmCard key={farm._id || index} farm={farm} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">
              No farms added yet.
            </p>
          )}
          <AddNewFarmCard onClick={onAddFarmClick} />
        </div>
      </div>
    </div>
  );
};

export default AllFarms;
