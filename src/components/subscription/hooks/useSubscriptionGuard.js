import { useState, useCallback, useMemo } from "react";
import { message } from "antd";
import { hasPlanFeature } from "../../../utils/subscriptionAccess";

export const useSubscriptionGuard = ({ field, featureKey }) => {
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showPricingOverlay, setShowPricingOverlay] = useState(false);
  const [pricingFieldData, setPricingFieldData] = useState(null);

  const hasFeatureAccess = useMemo(
    () => hasPlanFeature(field, featureKey),
    [field, featureKey],
  );

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

  const closeMembershipModal = useCallback(() => {
    setShowMembershipModal(false);
  }, []);

  const closePricingOverlay = useCallback(() => {
    setShowPricingOverlay(false);
    setPricingFieldData(null);
  }, []);

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
