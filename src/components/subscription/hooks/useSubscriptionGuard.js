import { useState, useCallback, useMemo } from "react";
import { message } from "antd";

export const useSubscriptionGuard = ({ field, featureKey }) => {
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  /**
   * FEATURE ACCESS DECISION (FINAL, CORRECT)
   */
  const hasFeatureAccess = useMemo(() => {
    if (!field?.subscription) return false;

    const sub = field.subscription;

    // Must be active (trial or paid)
    if (sub.active !== true && sub.hasActiveSubscription !== true) {
      return false;
    }

    // Feature-level access (trial & paid handled same way)
    if (featureKey && sub.plan?.features) {
      return Boolean(sub.plan.features[featureKey]);
    }

    // No featureKey provided → allow if active
    return true;
  }, [field, featureKey]);

  /**
   * SUBSCRIBE HANDLER
   */
  const handleSubscribe = useCallback(() => {
    if (!field) {
      message.warning("Please select a field first");
      return;
    }

    const areaInHectares =
      field?.areaInHectares ||
      (Number.isFinite(field?.acre) ? field.acre * 0.40468564224 : 0) ||
      5;

    setPricingFieldData({
      id: field._id,
      name: field.fieldName || field.farmName,
      cropName: field.cropName,
      areaInHectares,
    });

    setShowPricingOverlay(true);
    setShowMembershipModal(false);
  }, [field]);

  return {
    hasFeatureAccess,

    showMembershipModal,
    showPricingOverlay,
    pricingFieldData,

    handleSubscribe,
    closeMembershipModal: () => setShowMembershipModal(false),
    closePricingOverlay: () => {
      setShowPricingOverlay(false);
      setPricingFieldData(null);
    },
    setShowMembershipModal,
  };
};
