import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchForecastData } from "../../../redux/slices/weatherSlice";

const CACHE_TTL = 5 * 60 * 1000;

export const useWeatherForecast = (aoiId) => {
  const dispatch = useDispatch();

  const forecastData = useSelector(
    (state) => state?.weather?.forecastData ?? {},
  );

  const cacheTimestamps = useRef(new Map());

  // Get data for current AOI
  const data = aoiId && forecastData[aoiId] ? forecastData[aoiId] : null;

  const forecast = data?.forecast || null;
  const current = data?.current || null;
  const units = data?.units || null;

  useEffect(() => {
    if (!aoiId) return;

    const now = Date.now();
    const lastFetch = cacheTimestamps.current.get(aoiId) || 0;

    if (now - lastFetch < CACHE_TTL) return;

    cacheTimestamps.current.set(aoiId, now);
    dispatch(fetchForecastData({ geometry_id: aoiId }));
  }, [aoiId, dispatch]);

  const isStale =
    aoiId &&
    (!data ||
      Date.now() - (cacheTimestamps.current.get(aoiId) || 0) > CACHE_TTL);

  return {
    current,
    forecast,
    units,
    isStale,
    isLoading: !data || isStale,
  };
};
