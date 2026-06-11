import { TfmFacility } from '@ukef/dtfs2-common';

type GetMonthsOfCoverParams = {
  facilitySnapshot: TfmFacility['facilitySnapshot'];
  isBssEwcsDeal: boolean;
  isGefDeal: boolean;
};

/**
 * Safely parse an input value into a valid Date.
 * @param {unknown} value - A date-like input (string, number, Date).
 * @returns {Date | null} Parsed Date when valid, otherwise null.
 */
const parseDate = (value: unknown): Date | null => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value as string | number | Date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

/**
 * Resolve the facility cover end date from available snapshot fields.
 * Supports:
 * - `coverEndDate` (ISO/date-like value)
 * - legacy split fields (`coverEndDate-day`, `coverEndDate-month`, `coverEndDate-year`)
 * @param {TfmFacility['facilitySnapshot']} facilitySnapshot - Facility snapshot data.
 * @returns {Date | null} Cover end date when resolvable, otherwise null.
 */
const getCoverEndDate = (facilitySnapshot: TfmFacility['facilitySnapshot']): Date | null => {
  const coverEndDate = parseDate((facilitySnapshot as { coverEndDate?: unknown }).coverEndDate);

  if (coverEndDate) {
    return coverEndDate;
  }

  const coverEndDateDay = Number((facilitySnapshot as { 'coverEndDate-day'?: unknown })['coverEndDate-day']);
  const coverEndDateMonth = Number((facilitySnapshot as { 'coverEndDate-month'?: unknown })['coverEndDate-month']);
  const coverEndDateYear = Number((facilitySnapshot as { 'coverEndDate-year'?: unknown })['coverEndDate-year']);

  if (!coverEndDateDay || !coverEndDateMonth || !coverEndDateYear) {
    return null;
  }

  const parsedCoverEndDate = new Date(Date.UTC(coverEndDateYear, coverEndDateMonth - 1, coverEndDateDay));

  if (Number.isNaN(parsedCoverEndDate.getTime())) {
    return null;
  }

  return parsedCoverEndDate;
};

/**
 * Calculate total cover months between two dates.
 * Includes a partial final month where the end day is after the start day,
 * and returns a minimum of 1 month for same-day coverage.
 * @param {Date} startDate - Cover start date.
 * @param {Date} endDate - Cover end date.
 * @returns {number | null} Total months of cover, or null when end is before start.
 */
const getTotalMonths = (startDate: Date, endDate: Date): number | null => {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  if (endTime < startTime) {
    return null;
  }

  const yearDifference = endDate.getUTCFullYear() - startDate.getUTCFullYear();
  const monthDifference = endDate.getUTCMonth() - startDate.getUTCMonth();
  const dayDifference = endDate.getUTCDate() - startDate.getUTCDate();

  let totalMonths = yearDifference * 12 + monthDifference;

  if (dayDifference > 0 || (yearDifference === 0 && monthDifference === 0 && dayDifference === 0)) {
    totalMonths += 1;
  }

  if (totalMonths <= 0) {
    return 1;
  }

  return totalMonths;
};

/**
 * Resolve facility months of cover for APIM GIFT payload mapping.
 * - GEF: read directly from `facilitySnapshot.monthsOfCover`.
 * - BSS/EWCS: derive from `requestedCoverStartDate` and cover end date fields.
 * @param {GetMonthsOfCoverParams} params - Input containing facility snapshot and deal type flags.
 * @returns {number | null} Months of cover or null when unavailable/unresolvable.
 */
export const getMonthsOfCover = ({ facilitySnapshot, isBssEwcsDeal, isGefDeal }: GetMonthsOfCoverParams): number | null => {
  if (isGefDeal) {
    return facilitySnapshot.monthsOfCover ? Number(facilitySnapshot.monthsOfCover) : null;
  }

  if (!isBssEwcsDeal) {
    return null;
  }

  const requestedCoverStartDate = parseDate((facilitySnapshot as { requestedCoverStartDate?: unknown }).requestedCoverStartDate);
  const coverEndDate = getCoverEndDate(facilitySnapshot);

  if (!requestedCoverStartDate || !coverEndDate) {
    return null;
  }

  return getTotalMonths(requestedCoverStartDate, coverEndDate);
};
