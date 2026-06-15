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
export const parseDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const normalisedValue = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : (value as string | number | Date);

  const parsedDate = new Date(normalisedValue);

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
export const getCoverEndDate = (facilitySnapshot: TfmFacility['facilitySnapshot']): Date | null => {
  const coverEndDate = parseDate(facilitySnapshot.coverEndDate);

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
 * Resolve the requested cover start date from available snapshot fields.
 * Supports:
 * - `requestedCoverStartDate` (ISO/date-like value)
 * - legacy split fields (`requestedCoverStartDate-day`, `requestedCoverStartDate-month`, `requestedCoverStartDate-year`)
 * @param {TfmFacility['facilitySnapshot']} facilitySnapshot - Facility snapshot data.
 * @returns {Date | null} Requested cover start date when resolvable, otherwise null.
 */
export const getRequestedCoverStartDate = (facilitySnapshot: TfmFacility['facilitySnapshot']): Date | null => {
  const requestedCoverStartDate = parseDate(facilitySnapshot.requestedCoverStartDate);

  if (requestedCoverStartDate) {
    return requestedCoverStartDate;
  }

  const day = Number((facilitySnapshot as { 'requestedCoverStartDate-day'?: unknown })['requestedCoverStartDate-day']);
  const month = Number((facilitySnapshot as { 'requestedCoverStartDate-month'?: unknown })['requestedCoverStartDate-month']);
  const year = Number((facilitySnapshot as { 'requestedCoverStartDate-year'?: unknown })['requestedCoverStartDate-year']);

  if (!day || !month || !year) {
    return null;
  }

  const parsedRequestedCoverStartDate = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(parsedRequestedCoverStartDate.getTime())) {
    return null;
  }

  return parsedRequestedCoverStartDate;
};

/**
 * Calculate total cover months between two dates.
 * Includes a partial final month where the end day is after the start day,
 * and returns a minimum of 1 month for same-day coverage.
 * @param {Date} startDate - Cover start date.
 * @param {Date} endDate - Cover end date.
 * @returns {number | null} Total months of cover, or null when end is before start.
 */
export const getTotalMonths = (startDate: Date, endDate: Date): number | null => {
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
 * - GEF: derive from `coverStartDate` and cover end date fields.
 *   Falls back to `facilitySnapshot.monthsOfCover` when either date is absent
 *   (e.g. unissued facilities where cover dates are not yet set).
 * - BSS/EWCS: prefer `ukefGuaranteeInMonths` when present and positive.
 * - BSS/EWCS fallback: derive from requested cover start and cover end date fields,
 *   including support for legacy split date components.
 * @param {GetMonthsOfCoverParams} params - Input containing facility snapshot and deal type flags.
 * @returns {number | null} Months of cover or null when unavailable/unresolvable.
 */
export const getMonthsOfCover = ({ facilitySnapshot, isBssEwcsDeal, isGefDeal }: GetMonthsOfCoverParams): number | null => {
  if (isGefDeal) {
    const coverStartDate = parseDate(facilitySnapshot.coverStartDate);
    const coverEndDate = getCoverEndDate(facilitySnapshot);

    if (coverStartDate && coverEndDate) {
      return getTotalMonths(coverStartDate, coverEndDate);
    }

    // Fallback for unissued GEF facilities where cover dates are not yet populated.
    const rawMonths = facilitySnapshot.monthsOfCover;
    const months = rawMonths === null || rawMonths === undefined ? null : Number(rawMonths);

    return months !== null && Number.isFinite(months) ? months : null;
  }

  if (!isBssEwcsDeal) {
    return null;
  }

  const ukefGuaranteeInMonths = Number((facilitySnapshot as { ukefGuaranteeInMonths?: unknown }).ukefGuaranteeInMonths);

  // BSS/EWCS snapshots may already carry the canonical guarantee length.
  if (Number.isFinite(ukefGuaranteeInMonths) && ukefGuaranteeInMonths > 0) {
    return ukefGuaranteeInMonths;
  }

  const requestedCoverStartDate = getRequestedCoverStartDate(facilitySnapshot);
  const coverEndDate = getCoverEndDate(facilitySnapshot);

  if (!requestedCoverStartDate || !coverEndDate) {
    return null;
  }

  return getTotalMonths(requestedCoverStartDate, coverEndDate);
};
