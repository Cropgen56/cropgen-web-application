import React from "react";
import { useSelector } from "react-redux";
import {
  DropIcon,
  WaveIcon,
  WindSpeedIcon,
} from "../../../assets/DashboardIcons";
import {
  Sun,
  RainSun,
  Cloudesun,
  RainCloude,
} from "../../../assets/image/weather/index.js";

import PremiumContentWrapper from "../../subscription/PremiumContentWrapper";
import FeatureGuard from "../../subscription/FeatureGuard.jsx";
import { useSubscriptionGuard } from "../../subscription/hooks/useSubscriptionGuard";
import { selectForecastForGeometry } from "../../../redux/slices/weatherSlice";

function ForeCast({
  selectedFieldDetails,
  bypassPremium = false,
  isPreparedForPDF = false,
  aoiId = null,
}) {
  const forecastData = useSelector(selectForecastForGeometry(aoiId)) || {};

  const isLoading = useSelector((state) => state?.weather?.loading);

  const forecastGuard = useSubscriptionGuard({
    field: selectedFieldDetails,
    featureKey: "weatherAnalytics",
  });

  const weatherData = {
    currentConditions: {
      temp: forecastData.current?.temp || null,
      humidity: forecastData.current?.relative_humidity || null,
      pressure: forecastData.current?.surface_pressure || null,
      windspeed: forecastData.current?.wind_speed || null,
      precipitation: forecastData.current?.precipitation || null,
      cloudCover: forecastData.current?.cloud_cover || 0,
    },
    days: forecastData.forecast
      ? forecastData.forecast.time.slice(0, 16).map((date, index) => ({
          datetime: date,
          temp: forecastData.forecast.temp_mean[index] || null,
          precipprob: forecastData.forecast.precipitation[index] || 0,
          cloudCover: forecastData.forecast.cloud_cover?.[index] || 0,
        }))
      : [],
  };

  const getWeatherIcon = (temperature, cloudCover) => {
    if (!cloudCover && !temperature) return "🧊";
    if (cloudCover >= 90)
      return <RainCloude className="w-8 h-8 lg:w-11 lg:h-11" />;
    if (cloudCover >= 70)
      return <RainSun className="w-8 h-8 lg:w-11 lg:h-11" />;
    if (cloudCover >= 40) return <Cloudesun />;
    if (cloudCover < 40) return <Sun />;

    if (temperature >= 35) return <Sun />;
    if (temperature >= 25) return <Cloudesun />;
    if (temperature >= 15) return <Cloudesun />;
    if (temperature >= 5) return <Cloudesun />;
    if (temperature >= -5) return "❄️";
    return "🧊";
  };

  const { currentConditions: weather = {}, days: weekForecast = [] } =
    weatherData;

  const today = new Date().toISOString().split("T")[0];
  const hasForecastData =
    weather.temp != null ||
    weather.windspeed != null ||
    (weekForecast.length > 0 && weekForecast.some((d) => d.temp != null));

  // Only show skeleton when user can actually see the forecast.
  // Otherwise it briefly flashes before the premium locked UI.
  const shouldShowSkeleton =
    !isPreparedForPDF &&
    isLoading &&
    !hasForecastData &&
    (bypassPremium || forecastGuard.hasFeatureAccess);

  const skeletonContent = (
    <div className="flex items-start w-full gap-6 lg:flex-row animate-pulse">
      {/* Today's weather skeleton */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="p-[2px] rounded-xl bg-gray-100 shadow-xl">
          <div className="bg-white rounded-xl p-4 w-[200px] flex flex-col items-center shadow-xl h-full">
            <h3 className="h-5 w-28 bg-gray-200 rounded mb-4" />
            <div className="h-12 w-20 bg-gray-200 rounded mb-3" />
            <div className="h-7 w-24 bg-gray-200 rounded mb-5" />
            <div className="flex flex-col gap-2 text-xs lg:text-sm w-full">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly weather skeleton */}
      <div className="flex flex-col flex-1 w-full min-w-0">
        <div className="h-6 w-40 bg-gray-200 rounded mb-2 pl-2" />
        <div className="flex overflow-x-auto no-scrollbar gap-2 py-2 w-full">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-xl min-w-[130px] h-[150px]"
            >
              <div className="h-4 w-16 bg-gray-200 rounded mx-auto mt-4" />
              <div className="h-10 w-10 bg-gray-200 rounded mx-auto mt-4" />
              <div className="h-6 w-20 bg-gray-200 rounded mx-auto mt-4" />
              <div className="h-4 w-12 bg-gray-200 rounded mx-auto mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ===== WEATHER DATA CONTENT ===== */

  const weatherContent = (
    <div className="flex items-start w-full gap-6 lg:flex-row">
      {isPreparedForPDF && !hasForecastData ? (
        <div className="w-full py-8 px-4 text-center bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-600 text-sm">
            Weather data is loading or not available for this location.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Please wait a moment and try again, or ensure the field has valid
            coordinates.
          </p>
        </div>
      ) : (
        <>
          {/* Today's Weather */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="p-[2px] rounded-xl bg-gray-100 shadow-xl">
              <div className="bg-white rounded-xl p-4 w-[200px] flex flex-col items-center shadow-xl h-full">
                <h3 className="text-sm lg:text-base font-semibold mb-2 text-gray-700">
                  Today's Weather
                </h3>

                <div className="flex items-center justify-center mb-2 text-4xl text-gray-800">
                  {getWeatherIcon(weather.temp, weather.cloudCover)}
                </div>

                <div className="text-2xl lg:text-3xl font-bold mb-2 text-gray-900">
                  {weather.temp ?? "--"}°C
                </div>

                <div className="flex flex-col gap-2 text-xs lg:text-sm w-full text-gray-600">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <WindSpeedIcon /> {weather.windspeed ?? "--"} km/h
                    </span>
                    <span className="flex items-center gap-1">
                      <DropIcon /> {weather.humidity ?? "--"}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <WaveIcon /> {weather.pressure ?? "--"} hPa
                    </span>
                    <span>{weather.precipitation ?? "--"} mm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Weather */}
          <div className="flex flex-col flex-1 w-full min-w-0">
            <h3 className="text-[22px] font-bold text-gray-700 mb-2 pl-2">
              Weekly Weather
            </h3>

            <div className="flex overflow-x-auto no-scrollbar gap-2 py-2 w-full">
              {weekForecast.map((day, index) => {
                const icon = getWeatherIcon(day.temp, day.cloudCover);
                const isToday = day.datetime === today;

                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl min-w-[130px] h-[150px] ${
                      isToday
                        ? "bg-gray-200 text-gray-900"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="text-sm font-semibold mb-1">
                      {new Date(day.datetime).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </span>
                    <span className="text-3xl mb-1">{icon}</span>
                    <span className="text-lg font-bold">
                      {day.temp ?? "--"}°C
                    </span>
                    <span className="text-sm mt-1">{day.precipprob ?? 0}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );

  /* ===== CONDITIONAL PREMIUM HANDLING ===== */

  return (
    <div className="mt-8 bg-white rounded-2xl shadow border">
      {/* Always-visible section header */}
      <div className="px-5 py-3 border-b flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#344E41]">Weather Forecast</h2>
        {!bypassPremium && !forecastGuard.hasFeatureAccess && (
          <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            Premium
          </span>
        )}
      </div>

      {/* Content — blurred when locked, shown normally when accessible */}
      <div className="px-6 py-4">
        {shouldShowSkeleton ? (
          skeletonContent
        ) : bypassPremium ? (
          weatherContent
        ) : (
          <FeatureGuard guard={forecastGuard} title="Weather Forecast">
            <PremiumContentWrapper
              isLocked={!forecastGuard.hasFeatureAccess}
              onSubscribe={forecastGuard.handleSubscribe}
              title="Weather Forecast"
            >
              {weatherContent}
            </PremiumContentWrapper>
          </FeatureGuard>
        )}
      </div>
    </div>
  );
}

export default React.memo(ForeCast);
