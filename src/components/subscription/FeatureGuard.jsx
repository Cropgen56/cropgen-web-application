import { AnimatePresence, motion } from "framer-motion";
import SubscriptionModal from "./SubscriptionModal";
import PricingOverlay from "../pricing/PricingOverlay";
import PremiumPageWrapper from "./PremiumPageWrapper";

const FeatureGuard = ({ guard, title, children }) => {
  return (
    <>
      <SubscriptionModal
        isOpen={guard.showMembershipModal}
        onClose={guard.closeMembershipModal}
        onSubscribe={guard.handleSubscribe}
        onSkip={guard.closeMembershipModal}
        fieldName={guard.pricingFieldData?.name}
      />

      <AnimatePresence>
        {guard.showPricingOverlay && guard.pricingFieldData && (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
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

      <PremiumPageWrapper
        isLocked={!guard.hasFeatureAccess}
        onSubscribe={guard.handleSubscribe}
        title={title}
      >
        {children}
      </PremiumPageWrapper>
    </>
  );
};

export default FeatureGuard;
