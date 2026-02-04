import { useState, useCallback, useMemo } from "react";
import { message } from "antd";

export const useSubscriptionGuard = ({
  field,
  featureKey, // ex: "weatherAnalytics", "soilAnalytics"
}) => {
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  const hasSubscription = field?.subscription?.hasActiveSubscription;

  const hasFeatureAccess = useMemo(() => {
    return hasSubscription && field?.subscription?.plan?.features?.[featureKey];
  }, [hasSubscription, field, featureKey]);

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

  const closeMembershipModal = () => {
    setShowMembershipModal(false);
  };

  const closePricingOverlay = () => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);
  };

  return {
    hasFeatureAccess,
    showMembershipModal,
    showPricingOverlay,
    pricingFieldData,
    handleSubscribe,
    closeMembershipModal,
    closePricingOverlay,
    setShowMembershipModal,
  };
};
