import { useState, useCallback, useMemo } from "react";
import { message } from "antd";

export const useSubscriptionGuard = ({ field, featureKey }) => {
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  /* =====================================================
     FEATURE ACCESS (STRICT & CORRECT)
  ===================================================== */

  const hasFeatureAccess = useMemo(() => {
    if (!field?.subscription) return false;

    const sub = field.subscription;

    // Only ACTIVE subscription gets access
    if (sub.status !== "active") {
      return false;
    }

    // Feature-level validation
    if (featureKey && sub.plan?.features) {
      return Boolean(sub.plan.features[featureKey]);
    }

    return true;
  }, [field, featureKey]);

  /* =====================================================
     SUBSCRIBE HANDLER
  ===================================================== */

  const handleSubscribe = useCallback(() => {
    if (!field) {
      message.warning("Please select a field first");
      return;
    }

    const areaInAcre = Number(field?.acre);

    if (!areaInAcre || areaInAcre <= 0) {
      message.warning("Invalid field area");
      return;
    }

    setPricingFieldData({
      id: field._id,
      name: field.fieldName,
      cropName: field.cropName,
      acre: areaInAcre,
      subscription: field.subscription || null,
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
