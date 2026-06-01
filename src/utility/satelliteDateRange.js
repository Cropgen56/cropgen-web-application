import { getSixMonthsBeforeDate, getTodayDate } from "./formatDate";

/** Satellite lookback for barren / pre-sowing fields (present → last 2 weeks). */
export const BARREN_SATELLITE_LOOKBACK_DAYS = 14;

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isBarrenLandField(field) {
  return Boolean(field?.isBarrenLand);
}

export function isFutureSowingDate(sowingDate) {
  if (!sowingDate) return false;
  const sowing = new Date(sowingDate);
  const today = new Date();
  sowing.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return sowing > today;
}

export function getDaysBeforeToday(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

/**
 * Satellite availability / timeseries window for a farm field.
 * Barren land (planned future sowing): today back 14 days — not from sowing date.
 */
export function getSatelliteDateRangeForField(field) {
  const endDate = getTodayDate();

  if (isBarrenLandField(field)) {
    return {
      startDate: getDaysBeforeToday(BARREN_SATELLITE_LOOKBACK_DAYS),
      endDate,
    };
  }

  return {
    startDate: getSixMonthsBeforeDate(),
    endDate,
  };
}

export function fieldHasSatelliteGeometry(field) {
  return Array.isArray(field?.field) && field.field.length >= 3;
}

/** Barren fields only need geometry; cropped fields need a sowing date. */
export function canFetchSatelliteForField(field) {
  if (!fieldHasSatelliteGeometry(field)) return false;
  if (isBarrenLandField(field)) return true;
  return Boolean(field?.sowingDate);
}

export function formatDaysUntilSowingLabel(daysUntil) {
  if (daysUntil == null || Number.isNaN(Number(daysUntil))) return "Pre-sowing";
  const n = Number(daysUntil);
  if (n === 0) return "Sowing today";
  if (n < 0) return `Sowing overdue by ${Math.abs(n)} days`;
  return `${n} days until sowing`;
}
