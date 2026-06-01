import React from "react";
import { useSelector } from "react-redux";
import NpkChartSkeleton from "../../Skeleton/NpkChartSkeleton";
import { Sprout, CheckCircle2, Beaker, CalendarDays } from "lucide-react";

const STATUS_CARD_ICONS = {
  status: CheckCircle2,
  next: Beaker,
  planning: CalendarDays,
};

const NutrientBar = React.memo(
  ({
    label,
    symbol,
    current = 0,
    required = 0,
    unit = "kg/ha",
    deficitLabel = null,
    applyMessage = null,
    colorCurrent,
    colorRequired,
  }) => {
    const max = Math.max(current, required, 1);
    const currentWidth = `${(current / max) * 100}%`;
    const requiredWidth = `${(required / max) * 100}%`;

    return (
      <div className="flex items-start gap-2 sm:gap-3 md:gap-2 mb-3 sm:mb-4 bg-gray-50 rounded-lg p-2 sm:p-3 md:p-2 shadow-sm border border-gray-200">
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-6 md:h-6 bg-lime-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-white font-bold text-xs sm:text-sm md:text-[10px]">
            {symbol}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <span className="block text-sm sm:text-base md:text-xs font-semibold text-ember-sidebar mb-1 sm:mb-2">
            {label}
          </span>

          <div className="bg-gray-200 h-1.5 sm:h-2 md:h-1.5 rounded-full mb-1 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ backgroundColor: colorCurrent, width: currentWidth }}
            />
          </div>

          <div className="bg-gray-200 h-1.5 sm:h-2 md:h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ backgroundColor: colorRequired, width: requiredWidth }}
            />
          </div>

          {applyMessage && (
            <p className="mt-1.5 text-[10px] sm:text-xs font-semibold text-emerald-800">
              {applyMessage}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end shrink-0 min-w-[72px] sm:min-w-[84px]">
          {deficitLabel ? (
            <span className="text-[10px] sm:text-xs font-bold text-amber-700 mb-1 text-right leading-tight">
              {deficitLabel}
            </span>
          ) : null}
          <span className="text-xs sm:text-sm md:text-[10px] font-bold text-gray-900">{`${current} ${unit}`}</span>
          <span className="text-xs sm:text-sm md:text-[10px] font-medium text-gray-600">{`${required} ${unit}`}</span>
        </div>
      </div>
    );
  },
);
NutrientBar.displayName = "NutrientBar";

const SoilAnalysisChart = ({ isPreparedForPDF = false }) => {
  const smartAdvisory = useSelector((s) => s.smartAdvisory?.advisory || null);
  const advisoryLoading = Boolean(useSelector((s) => s.smartAdvisory?.loading));

  const display = smartAdvisory?.npkManagement?.display ?? null;
  const recommendation =
    smartAdvisory?.npkManagement?.recommendation ||
    display?.recommendationFallback ||
    "";

  if (advisoryLoading) return <NpkChartSkeleton />;

  if (!display) {
    return (
      <div className="w-full px-2 sm:px-4 md:pl-1 text-sm text-gray-600">
        NPK data will appear when the latest advisory is available for this field.
      </div>
    );
  }

  const { view, unit = "kg/ha", legend, nutrients = [] } = display;

  return (
    <div
      className={`w-full px-2 sm:px-4 md:pl-1 ${
        isPreparedForPDF ? "" : "md:scale-[0.95]"
      }`}
    >
      {view === "zero_baseline" ? (
        <div className="mb-4 sm:mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Sprout size={22} />
            </div>
            <div className="min-w-0">
              {display.bannerTitle && (
                <p className="text-sm sm:text-base font-semibold text-emerald-900">
                  {display.bannerTitle}
                </p>
              )}
              {display.bannerDescription && (
                <p className="text-xs sm:text-sm text-emerald-800/90 mt-1">
                  {display.bannerDescription}
                </p>
              )}
            </div>
          </div>

          {Array.isArray(display.statusCards) && display.statusCards.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
              {display.statusCards.map((card) => {
                const Icon = STATUS_CARD_ICONS[card.key] || CheckCircle2;
                return (
                  <div
                    key={card.key}
                    className="rounded-xl border border-emerald-200 bg-white p-3"
                  >
                    <div className="flex items-center gap-2 text-emerald-700 mb-1">
                      <Icon size={15} />
                      <span className="text-xs font-semibold">{card.title}</span>
                    </div>
                    <p className="text-xs text-gray-700">{card.body}</p>
                  </div>
                );
              })}
            </div>
          )}

          {recommendation && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                <strong>Recommendation:</strong> {recommendation}
              </p>
            </div>
          )}
        </div>
      ) : view === "harvest_banner" ? (
        <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-yellow-500 mb-4 sm:mb-6">
          {display.bannerTitle && (
            <span className="block text-sm sm:text-base font-semibold text-orange-800 text-center">
              {display.bannerTitle}
            </span>
          )}
        </div>
      ) : (
        <>
          {display.growthStageLabel && (
            <div className="mb-3 sm:mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
              <span className="block text-xs sm:text-sm font-semibold text-emerald-900">
                Growth stage: {display.growthStageLabel}
              </span>
              {display.growthStageSubtitle && (
                <span className="block text-[10px] sm:text-xs text-emerald-800/80 mt-0.5">
                  {display.growthStageSubtitle}
                </span>
              )}
            </div>
          )}

          {legend && (
            <div className="flex justify-end items-center mb-2 sm:mb-3 md:mb-2">
              <div className="flex items-center mr-4 sm:mr-6">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded-sm mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm md:text-xs text-gray-700">
                  {legend.current}
                </span>
              </div>

              <div className="flex items-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-lime-400 rounded-sm mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm md:text-xs text-gray-700">
                  {legend.required}
                </span>
              </div>
            </div>
          )}

          {nutrients.map((item) => (
            <NutrientBar
              key={item.symbol}
              label={item.label}
              symbol={item.symbol}
              current={item.current}
              required={item.required}
              unit={unit}
              deficitLabel={item.deficitLabel}
              applyMessage={item.applyMessage}
              colorCurrent="#36A534"
              colorRequired="#C4E930"
            />
          ))}

          {display.applySummary && (
            <div className="mb-3 sm:mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-xs sm:text-sm font-semibold text-amber-900">
                {display.applySummary}
              </p>
            </div>
          )}

          {recommendation && (
            <div className="mt-4 sm:mt-6 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-300">
              <span className="block text-[10px] sm:text-[12px] font-medium text-gray-800">
                <strong>Recommendations:</strong> {recommendation}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SoilAnalysisChart;
