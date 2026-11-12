import FeatureGuardBase from "./FeatureGuardComponent";

/**
 * Modal/overlay host only: does NOT lock its children. The caller must lock
 * its own content (PremiumContentWrapper / PremiumPageWrapper / hasFeatureAccess
 * checks). For a guard that locks the children itself, import
 * `./FeatureGuardComponent` instead.
 */
const FeatureGuard = (props) => <FeatureGuardBase {...props} lock={false} />;

export default FeatureGuard;
