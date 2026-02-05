import { useState, useCallback, useMemo } from "react";
import { message } from "antd";

export const useSubscriptionGuard = ({ field, featureKey }) => {
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  const hasFeatureAccess = useMemo(() => {
    if (!field?.subscription) return false;

    // Plan-based subscription (Weather, Operation)
    if (field.subscription?.plan?.features) {
      return Boolean(field.subscription.plan.features[featureKey]);
    }

    // Direct subscription (Smart Advisory)
    if (
      field.subscription?.hasActiveSubscription === true ||
      field.subscription?.active === true
    ) {
      return true;
    }

    return false;
  }, [field, featureKey]);

  const handleSubscribe = useCallback(() => {
    if (!field) {
      message.warning("Please select a field first");
      return;
    }

    const areaInHectares = field?.areaInHectares || field?.acre * 0.404686 || 5;

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
