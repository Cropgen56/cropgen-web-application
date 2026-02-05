import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFarmFields } from "../redux/slices/farmSlice";
import OperationSidebar from "../components/operation/operationsidebar/OperationSidebar";
import Calendar from "../components/operation/operationcalender/OperationCalender";
import { useNavigate } from "react-router-dom";
import img1 from "../assets/image/Group 31.png";
import FieldDropdown from "../components/comman/FieldDropdown";

import FeatureGuard from "../components/subscription/FeatureGuard";
import { useSubscriptionGuard } from "../components/subscription/hooks/useSubscriptionGuard";

const Operation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const fields = useSelector((state) => state?.farmfield?.fields);

  const userId = user?.id;

  const [selectedField, setSelectedField] = useState(null);

  /* ---------- FETCH FIELDS (UNCHANGED) ---------- */

  useEffect(() => {
    if (userId) {
      dispatch(getFarmFields(userId));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (fields?.length > 0 && !selectedField) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField]);

  /* ---------- SUBSCRIPTION LOGIC (COMMON) ---------- */

  const subscriptionGuard = useSubscriptionGuard({
    field: selectedField,
    featureKey: "farmOperationsManagement",
  });

  /* ---------- EMPTY STATE (UNCHANGED UI) ---------- */

  if (fields?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        <img
          src={img1}
          alt="No Fields"
          className="w-[400px] h-[400px] mb-6 opacity-70"
        />
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to make an Operation
        </h2>
        <button
          onClick={() => navigate("/addfield")}
          className="mt-6 px-5 py-2 rounded-lg bg-white text-[#5a7c6b] font-medium hover:bg-gray-200 transition"
        >
          Add Field
        </button>
      </div>
    );
  }

  /* ---------- MAIN UI (UNCHANGED STRUCTURE) ---------- */

  return (
    <div className="w-full h-full m-0 p-0 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <OperationSidebar
          setSelectedField={setSelectedField}
          selectedField={selectedField}
          hasSubscription={subscriptionGuard.hasFeatureAccess}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#5a7c6b] h-screen overflow-y-auto">
        {/* Mobile Dropdown */}
        <div className="lg:hidden p-3">
          <FieldDropdown
            fields={fields}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
          />
        </div>

        <FeatureGuard
          guard={subscriptionGuard}
          title="Farm Operations Management"
        >
          <Calendar selectedField={selectedField?._id} />
        </FeatureGuard>
      </div>
    </div>
  );
};

export default Operation;
