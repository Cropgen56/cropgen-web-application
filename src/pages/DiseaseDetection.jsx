import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import img1 from "../assets/image/Group 31.png";
import { getFarmFields } from "../redux/slices/farmSlice";

import Sidebardiseasedetection from "../components/diseasedetection/sidebar/Sidebardiseasedetection";
import UploadCropImage from "../components/diseasedetection/uploadcropimage/UploadCropImage";

import FeatureGuard from "../components/subscription/FeatureGuardComponent";
import { useSubscriptionGuard } from "../components/subscription/hooks/useSubscriptionGuard";
import { useLiveSelectedField } from "../hooks/useLiveSelectedField";

import FieldDropdown from "../components/comman/FieldDropdown";

const DiseaseDetection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.auth?.user);
  const fieldsRaw = useSelector((state) => state?.farmfield?.fields);
  const fields = useMemo(() => fieldsRaw ?? [], [fieldsRaw]);
  const { selectedField, setSelectedField } = useLiveSelectedField(fields);

  const userId = user?.id;
  const [isSidebarVisible] = useState(true);

  useEffect(() => {
    if (userId) dispatch(getFarmFields(userId));
  }, [dispatch, userId]);

  const diseaseGuard = useSubscriptionGuard({
    field: selectedField,
    featureKey: "diseaseDetectionAlerts",
  });

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-[#5a7c6b] text-center px-4">
        <img
          src={img1}
          alt="No Fields"
          className="w-[400px] h-[400px] mb-6 opacity-70"
        />
        <h2 className="text-2xl font-semibold text-white">
          Add Farm to use Disease Detection
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

  return (
    <div className="m-0 p-0 w-full flex flex-row">
      {isSidebarVisible && (
        <div className="hidden lg:block">
          <Sidebardiseasedetection
            selectedField={selectedField}
            setSelectedField={setSelectedField}
            fields={fields}
            hasSubscription={diseaseGuard.hasFeatureAccess}
          />
        </div>
      )}

      <div className="w-full bg-[#5f7e6f] m-0 p-0 lg:ml-[320px] h-screen overflow-y-auto overflow-x-hidden">
        <div className="lg:hidden p-3">
          <FieldDropdown
            fields={fields}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
          />
        </div>

        <div className="p-4">
          <FeatureGuard
            guard={diseaseGuard}
            title="Disease Detection Alerts"
          >
            <UploadCropImage selectedField={selectedField} />
          </FeatureGuard>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
