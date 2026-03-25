import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import SubscriptionModal from "./SubscriptionModal";
import PricingOverlay from "../pricing/PricingOverlay";
const FeatureGuard = ({ guard, title, children }) => {
  useEffect(() => {
    if (!guard?.hasFeatureAccess) return;

    // Avoid render loops: only close when something is currently open.
    // Also do not depend on the whole `guard` object identity.
    const shouldClose =
      Boolean(guard.showMembershipModal) || Boolean(guard.showPricingOverlay);
    if (!shouldClose) return;

    guard.closeMembershipModal();
    guard.closePricingOverlay();
  }, [
    guard?.hasFeatureAccess,
    guard?.showMembershipModal,
    guard?.showPricingOverlay,
    guard?.closeMembershipModal,
    guard?.closePricingOverlay,
  ]);

  return (
    <>
      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={guard.showMembershipModal}
        onClose={guard.closeMembershipModal}
        onSubscribe={guard.handleSubscribe}
        onSkip={guard.closeMembershipModal}
        fieldName={guard.pricingFieldData?.name}
      />

      {/* Pricing Overlay */}
      <AnimatePresence>
        {guard.showPricingOverlay && guard.pricingFieldData && (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <PricingOverlay
              onClose={guard.closePricingOverlay}
              userArea={guard.pricingFieldData.areaInHectares}
              selectedField={guard.pricingFieldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Lock Wrapper */}
      {/* <PremiumPageWrapper
        isLocked={!guard.hasFeatureAccess}
        onSubscribe={guard.handleSubscribe}
        title={title}
      >
      </PremiumPageWrapper> */}
      {children}
    </>
  );
};

export default FeatureGuard;
