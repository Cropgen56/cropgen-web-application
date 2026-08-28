import {
  isSubscriptionActive,
  hasPlanFeature,
  fieldIsRecentlyCreated,
} from "./subscriptionAccess";

describe("isSubscriptionActive", () => {
  test("false when field or subscription is missing", () => {
    expect(isSubscriptionActive(null)).toBe(false);
    expect(isSubscriptionActive({})).toBe(false);
  });

  test("false when the field is area-locked", () => {
    expect(
      isSubscriptionActive({
        isLocked: true,
        subscription: { hasActiveSubscription: true, status: "active" },
      }),
    ).toBe(false);
  });

  test("true for hasActiveSubscription or status active", () => {
    expect(
      isSubscriptionActive({
        subscription: { hasActiveSubscription: true, status: "locked" },
      }),
    ).toBe(true);
    expect(
      isSubscriptionActive({
        subscription: { hasActiveSubscription: false, status: "active" },
      }),
    ).toBe(true);
  });
});

describe("hasPlanFeature", () => {
  const aatStarter = {
    subscription: {
      hasActiveSubscription: true,
      status: "active",
      plan: {
        features: {
          cropHealthAndYield: true,
          weatherAnalytics: true,
          smartAdvisorySystem: false,
          soilAnalysisAndHealth: false,
          diseaseDetectionAlerts: false,
        },
      },
    },
  };

  test("AAT Starter unlocks crop health, not smart advisory", () => {
    expect(hasPlanFeature(aatStarter, "cropHealthAndYield")).toBe(true);
    expect(hasPlanFeature(aatStarter, "weatherAnalytics")).toBe(true);
    expect(hasPlanFeature(aatStarter, "smartAdvisorySystem")).toBe(false);
    expect(hasPlanFeature(aatStarter, "soilAnalysisAndHealth")).toBe(false);
    expect(hasPlanFeature(aatStarter, "diseaseDetectionAlerts")).toBe(false);
  });

  test("unsubscribed farm never has features", () => {
    expect(
      hasPlanFeature(
        { subscription: { status: "locked", hasActiveSubscription: false } },
        "weatherAnalytics",
      ),
    ).toBe(false);
  });

  test("legacy plan without features map keeps full access once subscribed", () => {
    const legacy = {
      subscription: { hasActiveSubscription: true, status: "active", plan: {} },
    };
    expect(hasPlanFeature(legacy, "smartAdvisorySystem")).toBe(true);
  });

  test("legacy plan with an all-false features map (real API shape, schema defaults applied) keeps full access", () => {
    // The backend's `features` sub-schema defaults every flag to `false`,
    // so a plan whose admin never configured per-feature flags still
    // arrives with a fully-populated (all-false) `features` object, not a
    // missing one. This must be treated the same as "no features map".
    const legacy = {
      subscription: {
        hasActiveSubscription: true,
        status: "active",
        plan: {
          features: {
            satelliteImagery: false,
            cropHealthAndYield: false,
            soilAnalysisAndHealth: false,
            weatherAnalytics: false,
            vegetationIndices: false,
            waterIndices: false,
            evapotranspirationMonitoring: false,
            agronomicInsights: false,
            weeklyAdvisoryReports: false,
            cropGrowthMonitoring: false,
            farmOperationsManagement: false,
            diseaseDetectionAlerts: false,
            smartAdvisorySystem: false,
            soilReportGeneration: false,
          },
        },
      },
    };
    expect(hasPlanFeature(legacy, "cropHealthAndYield")).toBe(true);
    expect(hasPlanFeature(legacy, "soilAnalysisAndHealth")).toBe(true);
  });
});

describe("fieldIsRecentlyCreated", () => {
  test("true when createdAt is missing (just added)", () => {
    expect(fieldIsRecentlyCreated({ _id: "1" })).toBe(true);
  });

  test("true within the window, false after", () => {
    expect(
      fieldIsRecentlyCreated({ createdAt: new Date().toISOString() }, 60_000),
    ).toBe(true);
    expect(
      fieldIsRecentlyCreated(
        { createdAt: new Date(Date.now() - 120_000).toISOString() },
        60_000,
      ),
    ).toBe(false);
  });
});
