import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import IndexPremiumWrapper from "../subscription/Indexpremiumwrapper";

/* ===================== ROW ===================== */
const Row = ({ label, value }) => {
  if (!value) return null;

  return (
    <div className="text-[13px] leading-snug text-white/90">
      <span className="font-medium text-white">{label}: </span>
      {value}
    </div>
  );
};

/* ===================== CARD ===================== */
const AdvisoryCard = ({ title, icon, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="
        bg-[#344E41]
        rounded-lg
        p-4
        border border-white/10
        shadow-sm
        flex flex-col gap-2
      "
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <h3 className="text-[13px] font-semibold text-white tracking-wide">
          {title}
        </h3>
      </div>

      <div className="flex flex-col gap-1">
        {children}
      </div>
    </motion.div>
  );
};

/* ===================== MAIN ===================== */
const CropAdvisory = ({ onSubscribe, hasWeeklyAdvisoryReports }) => {
  const { advisory: data, loading } = useSelector(
    (s) => s.smartAdvisory || {}
  );

  const weekly = useMemo(() => {
    return data?.smartAdvisory?.weeklyAdvisory || null;
  }, [data]);

  return (
    <div className="mt-6">
      <h2 className="text-base font-semibold text-gray-900 mb-3">
        Crop Advisory
      </h2>

      <IndexPremiumWrapper
        isLocked={!hasWeeklyAdvisoryReports}
        onSubscribe={onSubscribe}
        title="Weekly Crop Recommendation"
      >
        {loading ? (
          <p className="text-gray-500 text-sm">Loading Recommendation…</p>
        ) : weekly ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Spray */}
            <AdvisoryCard title="Spray Recommendation" icon="🧪">
              <Row label="Problem" value={weekly.sprayRecommendation.problem} />
              <Row label="Chemical" value={weekly.sprayRecommendation.chemical} />
              <Row label="Dose" value={weekly.sprayRecommendation.dose} />
              <Row label="Time" value={weekly.sprayRecommendation.time} />
              <Row label="Purpose" value={weekly.sprayRecommendation.purpose} />
              <Row
                label="Instruction"
                value={weekly.sprayRecommendation.instruction}
              />
            </AdvisoryCard>

            {/* Fertigation */}
            <AdvisoryCard title="Fertigation Recommendation" icon="🌱">
              <Row
                label="Fertilizer"
                value={weekly.fertigationSchedule.fertilizer}
              />
              <Row label="Dose" value={weekly.fertigationSchedule.dose} />
              <Row label="Method" value={weekly.fertigationSchedule.method} />
              <Row label="Time" value={weekly.fertigationSchedule.time} />
              <Row label="Purpose" value={weekly.fertigationSchedule.purpose} />
              <Row
                label="Instruction"
                value={weekly.fertigationSchedule.instruction}
              />
            </AdvisoryCard>

            {/* Crop Risk */}
            <AdvisoryCard title="Crop Risk" icon="⚠️">
              <Row label="Risk Type" value={weekly.cropRiskAlert.riskType} />
              <Row label="Risk Level" value={weekly.cropRiskAlert.riskLevel} />
              <Row
                label="Preventive Chemical"
                value={weekly.cropRiskAlert.preventiveChemical}
              />
              <Row label="Dose" value={weekly.cropRiskAlert.dose} />
              <Row
                label="Instruction"
                value={weekly.cropRiskAlert.instruction}
              />
            </AdvisoryCard>

            {/* Weather */}
            <AdvisoryCard title="Weather Advisory" icon="🌦️">
              <Row label="Severity" value={weekly.weatherAlert.severity} />
              <Row label="Forecast" value={weekly.weatherAlert.forecast} />
              <Row
                label="Instruction"
                value={weekly.weatherAlert.instruction}
              />
            </AdvisoryCard>

          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center py-4">
            No advisory available for this week.
          </div>
        )}
      </IndexPremiumWrapper>
    </div>
  );
};

export default CropAdvisory;
