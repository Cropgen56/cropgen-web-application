import React, { useMemo, useState } from "react";
import { User, Tractor, CreditCard, Settings } from "lucide-react";
import PersonalInfo from "../components/setting/personalinfo/PersonalInfo";
import FarmSetting from "../components/setting/farmsetting/FarmSetting";
import Pricing from "../components/setting/pricing/Pricing";

const SETTINGS_OPTIONS = [
  {
    id: "personalInfo",
    label: "Personal Info",
    description: "Profile, contact & location",
    icon: User,
  },
  {
    id: "farmSettings",
    label: "Farm Settings",
    description: "Farms & subscriptions",
    icon: Tractor,
  },
  {
    id: "pricing",
    label: "Pricing",
    description: "Plans & billing",
    icon: CreditCard,
  },
];

const Setting = () => {
  const [selectedOption, setSelectedOption] = useState("personalInfo");
  const [mobileNavOpen, setMobileNavOpen] = useState(true);

  const selectedMeta = useMemo(
    () =>
      SETTINGS_OPTIONS.find((item) => item.id === selectedOption) ||
      SETTINGS_OPTIONS[0],
    [selectedOption],
  );

  const handleSelect = (id) => {
    setSelectedOption(id);
    setMobileNavOpen(false);
  };

  const renderContent = () => {
    const passThrough = {
      setShowSidebar: () => setMobileNavOpen(true),
    };
    switch (selectedOption) {
      case "farmSettings":
        return <FarmSetting {...passThrough} />;
      case "pricing":
        return <Pricing {...passThrough} />;
      case "personalInfo":
      default:
        return <PersonalInfo {...passThrough} />;
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#e8f3ed] via-ember-card to-white font-inter text-ember-text">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1400px] flex-col p-2 sm:p-3 lg:p-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-xl ring-1 ring-black/5 sm:rounded-3xl lg:min-h-[calc(100dvh-2rem)]">
          {/* Mobile: top bar */}
          <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2.5 lg:hidden">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5A7C6B] to-ember-sidebar text-white shadow-md">
                <Settings className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                  Settings
                </p>
                <p className="truncate text-sm font-semibold text-ember-sidebar">
                  {selectedMeta.label}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="min-h-[36px] shrink-0 rounded-xl border border-ember-border px-3.5 py-1.5 text-sm font-semibold text-ember-sidebar transition-colors hover:bg-ember-card"
            >
              {mobileNavOpen ? "Close" : "Sections"}
            </button>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
            {/* Sidebar nav */}
            <aside
              className={`border-gray-200 bg-gradient-to-b from-[#f1f8f4] via-[#f8fbf9] to-white lg:border-r ${
                mobileNavOpen ? "block" : "hidden lg:block"
              }`}
            >
              <div className="hidden border-b border-gray-200/80 p-4 lg:block xl:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5A7C6B] to-ember-sidebar text-white shadow-md">
                    <Settings className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold leading-tight text-ember-sidebar">
                      Settings
                    </h1>
                    <p className="text-xs text-gray-500">
                      Account and farm controls
                    </p>
                  </div>
                </div>
              </div>

              <nav
                className="flex gap-2 overflow-x-auto p-2 scrollbar-hide sm:p-3 lg:flex-col lg:gap-2 lg:overflow-visible lg:p-4"
                aria-label="Settings sections"
              >
                {SETTINGS_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = selectedOption === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect(option.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group min-w-[170px] shrink-0 rounded-xl border p-3 text-left transition-all duration-200 lg:min-w-0 lg:w-full ${
                        isActive
                          ? "border-ember-sidebar bg-gradient-to-r from-ember-sidebar to-[#4a6b59] text-white shadow-lg"
                          : "border-gray-200 bg-white text-ember-sidebar hover:-translate-y-0.5 hover:border-ember-sidebar/30 hover:bg-[#eef6f1] hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            isActive
                              ? "bg-white/15"
                              : "bg-ember-sidebar/10 group-hover:bg-ember-sidebar/15"
                          }`}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold sm:text-[15px]">
                            {option.label}
                          </span>
                          <span
                            className={`block text-xs leading-snug ${
                              isActive ? "text-white/80" : "text-gray-500"
                            }`}
                          >
                            {option.description}
                          </span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main panel */}
            <section
              className={`min-h-0 min-w-0 flex flex-col bg-[#f8fbf9] ${
                mobileNavOpen ? "hidden lg:flex" : "flex"
              }`}
            >
              {renderContent()}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
