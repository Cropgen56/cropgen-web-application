import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import SubscriptionModal from "./SubscriptionModal";
import PricingOverlay from "../pricing/PricingOverlay";
import PremiumPageWrapper from "./PremiumPageWrapper";

/**
 * Single feature-guard implementation.
 *
 * - `lock` (default true): replace `children` with the "not in this plan" lock
 *   card when `guard.hasFeatureAccess` is false.
 * - `lock={false}`: only host the subscribe modal / pricing overlay; the caller
 *   locks its own content (e.g. with PremiumContentWrapper). Use the
 *   `./FeatureGuard` wrapper for this mode.
 */
const FeatureGuard = ({
  guard,
  title,
  children,
  lock = true,
  inset = false,
  lockClassName = "",
}) => {
  const hasFeatureAccess = guard?.hasFeatureAccess;
  const showMembershipModal = guard?.showMembershipModal;
  const showPricingOverlay = guard?.showPricingOverlay;
  const closeMembershipModal = guard?.closeMembershipModal;
  const closePricingOverlay = guard?.closePricingOverlay;

  // Once access is granted (e.g. right after payment) close any open overlay.
  useEffect(() => {
    if (!hasFeatureAccess) return;
    if (!showMembershipModal && !showPricingOverlay) return;
    closeMembershipModal?.();
    closePricingOverlay?.();
  }, [
    hasFeatureAccess,
    showMembershipModal,
    showPricingOverlay,
    closeMembershipModal,
    closePricingOverlay,
  ]);

  return (
    <>
      <SubscriptionModal
        isOpen={showMembershipModal}
        onClose={closeMembershipModal}
        onSubscribe={guard?.handleSubscribe}
        onSkip={closeMembershipModal}
        fieldName={guard?.pricingFieldData?.name}
      />

      <AnimatePresence>
        {showPricingOverlay && guard?.pricingFieldData && (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-8"
          >
            <PricingOverlay
              onClose={closePricingOverlay}
              selectedField={guard.pricingFieldData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {lock ? (
        <PremiumPageWrapper
          isLocked={!hasFeatureAccess}
          onSubscribe={guard?.handleSubscribe}
          title={title}
          inset={inset}
          className={lockClassName}
        >
          {children}
        </PremiumPageWrapper>
      ) : (
        children
      )}
    </>
  );
};

export default FeatureGuard;
