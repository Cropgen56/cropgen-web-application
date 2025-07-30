import React from "react";
import SmartAdvisorySidebar from "../components/smartadvisory/smartadvisorysidebar/SmartAdvisorySidebar";
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../redux/slices/farmSlice";
import { useEffect } from "react";

const SmartAdvisory = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.auth?.user);
  const fields = useSelector((state) => state?.farmfield?.fields);

  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);
  return (
    <div className="flex h-screen  overflow-hidden bg-[#5a7c6b] text-white">
      {/* Sidebar (fixed width) */}
      <div className="w-[280px] h-full border-r border-gray-700">
        <SmartAdvisorySidebar />
      </div>



    </div>
  );
};

export default SmartAdvisory;
