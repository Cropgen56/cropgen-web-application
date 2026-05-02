import React, { useMemo, useState } from "react";
import { User, Tractor, CreditCard, Settings } from "lucide-react";
import PersonalInfo from "../components/setting/personalinfo/PersonalInfo";
import FarmSetting from "../components/setting/farmsetting/FarmSetting";
import Pricing from "../components/setting/pricing/Pricing";

const SETTINGS_OPTIONS = [
  {
    id: "personalInfo",
    label: "Personal Info",
    description: "Profile, contact details, and location",
    icon: User,
  },
  {
    id: "farmSettings",
    label: "Farm Settings",
    description: "Manage farms, metadata, and subscriptions",
    icon: Tractor,
  },
  {
    id: "pricing",
    label: "Pricing",
    description: "Plans, billing cycles, and feature access",
    icon: CreditCard,
  },
];

const Setting = () => {
  const [selectedOption, setSelectedOption] = useState("personalInfo");

  const selectedMeta = useMemo(
    () =>
      SETTINGS_OPTIONS.find((item) => item.id === selectedOption) ||
      SETTINGS_OPTIONS[0],
    [selectedOption],
  );

  const renderContent = () => {
    const passThrough = { setShowSidebar: () => {} };
    switch (selectedOption) {
      case "personalInfo":
        return <PersonalInfo {...passThrough} />;
      case "farmSettings":
        return <FarmSetting {...passThrough} />;
      case "pricing":
        return <Pricing {...passThrough} />;
      default:
        return <PersonalInfo {...passThrough} />;
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-ember-card font-inter">
      <div className="h-full w-full overflow-hidden p-2 sm:p-3 lg:p-4">
        <div className="h-full w-full rounded-2xl border border-ember-border bg-white shadow-sm overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)]">
            <aside className="border-r border-ember-border bg-gradient-to-b from-ember-card to-white p-3 sm:p-4">
              <div className="flex items-center gap-3 p-2.5">
                <div className="w-10 h-10 rounded-xl bg-ember-sidebar/10 text-ember-sidebar flex items-center justify-center">
                  <Settings size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-ember-primary leading-tight">
                    Settings
                  </h1>
                  <p className="text-xs text-ember-text-secondary">
                    Account and farm controls
                  </p>
                </div>
              </div>

              <nav className="mt-5 flex gap-2 overflow-x-auto lg:block lg:overflow-visible">
                {SETTINGS_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = selectedOption === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedOption(option.id)}
                      className={`text-left min-w-[200px] lg:min-w-0 lg:w-full rounded-xl border px-3 py-3 transition-all ${
                        isActive
                          ? "border-ember-sidebar bg-ember-sidebar text-white shadow-sm"
                          : "border-ember-border bg-white text-ember-primary hover:bg-ember-sidebar/5"
                      } ${option.id !== SETTINGS_OPTIONS[SETTINGS_OPTIONS.length - 1].id ? "lg:mb-3" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-semibold">{option.label}</span>
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          isActive ? "text-white/85" : "text-gray-500"
                        }`}
                      >
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <section className="min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto bg-ember-card px-1.5 py-1.5 sm:px-2.5 sm:py-2.5">
                {renderContent()}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;