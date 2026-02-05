import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import FarmReportSidebar from "../components/farmreport/farmreportsidebar/FarmReportSidebar";
import FarmReportContent from "../components/farmreport/farmreportsidebar/FarmReportContent";
import FieldDropdown from "../components/comman/FieldDropdown";
import LoadingSpinner from "../components/comman/loading/LoadingSpinner";

import FeatureGuard from "../components/subscription/FeatureGuard";
import { useSubscriptionGuard } from "../components/subscription/hooks/useSubscriptionGuard";

import { getFarmFields } from "../redux/slices/farmSlice";
import { clearIndexDataByType } from "../redux/slices/satelliteSlice";

import useFarmReportPDF from "../components/farmreport/useFarmReportPDF";
import { useAoiManagement } from "../components/dashboard/hooks/useAoiManagement";
import { useWeatherForecast } from "../components/dashboard/hooks/useWeatherForecast";

import img1 from "../assets/image/Group 31.png";

const FarmReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((s) => s.auth?.user);
  const fields = useSelector((s) => s.farmfield?.fields || []);
  const fieldsLoading = useSelector((s) => s.farmfield?.loading);

  const [selectedField, setSelectedField] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const mainReportRef = useRef(null);

  /* ================= FETCH FIELDS ================= */
  useEffect(() => {
    if (user?.id) dispatch(getFarmFields(user.id));
  }, [dispatch, user?.id]);

  /* ================= AUTO SELECT FIELD ================= */
  useEffect(() => {
    if (!selectedField && fields.length > 0) {
      setSelectedField(fields[fields.length - 1]);
    }
  }, [fields, selectedField]);

  /* ================= SYNC FIELD AFTER SUBSCRIPTION ================= */
  useEffect(() => {
    if (!selectedField || !fields.length) return;

    const updatedField = fields.find((f) => f._id === selectedField._id);

    if (
      updatedField &&
      JSON.stringify(updatedField.subscription) !==
        JSON.stringify(selectedField.subscription)
    ) {
      setSelectedField(updatedField);
    }
  }, [fields, selectedField]);

  /* ================= CLEAR OLD DATA ================= */
  useEffect(() => {
    if (selectedField?._id) {
      dispatch(clearIndexDataByType());
    }
  }, [dispatch, selectedField?._id]);

  /* ================= AOI + WEATHER ================= */
  const { aoiId } = useAoiManagement(selectedField);
  const { forecast, units } = useWeatherForecast(aoiId);

  /* ================= PDF ================= */
  const { isDownloading, isPreparedForPDF, downloadFarmReportPDF } =
    useFarmReportPDF(selectedField);

  /* ================= FEATURE GUARD ================= */
  const farmReportGuard = useSubscriptionGuard({
    field: selectedField,
    featureKey: "cropHealthAndYield",
  });

  /* ================= STATES ================= */
  if (fieldsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#344E41]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!fields.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#344E41] text-white">
        <img src={img1} className="w-[280px] mb-6 opacity-60" />
        <button
          onClick={() => navigate("/addfield")}
          className="px-6 py-3 bg-white text-[#344E41] rounded-lg"
        >
          Add Field
        </button>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="flex h-screen bg-[#344E41] text-white">
      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="hidden lg:flex">
          <FarmReportSidebar
            setSelectedField={setSelectedField}
            setIsSidebarVisible={setIsSidebarVisible} // ✅ FIX
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {!selectedField ? (
          <FieldDropdown
            fields={fields}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
          />
        ) : (
          <>
            <div className="mb-3 flex justify-between bg-[#2d4339] p-2 rounded">
              <button
                onClick={() => setSelectedField(null)}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={16} /> Back
              </button>

              <button
                onClick={() => downloadFarmReportPDF(mainReportRef)}
                className="bg-[#0C2214] text-white px-4 py-1 rounded"
              >
                {isDownloading ? "Generating..." : "PDF"}
              </button>
            </div>

            <FeatureGuard guard={farmReportGuard} title="Farm Report">
              <div ref={mainReportRef}>
                <FarmReportContent
                  selectedFieldDetails={selectedField}
                  forecast={forecast}
                  units={units}
                  isPreparedForPDF={isPreparedForPDF}
                />
              </div>
            </FeatureGuard>
          </>
        )}
      </div>
    </div>
  );
};

export default FarmReport;
