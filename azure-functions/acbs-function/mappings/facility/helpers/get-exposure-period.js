/* calculating exposure period based on Portal V2 algorithm */
const CONSTANTS = require('../../../constants');
const {
  isDate,
  formatYear,
  formatTimestamp,
  getMonthDifference,
  isSameDayOfMonth,
  getDateStringFromYearMonthDay,
} = require('../../../helpers/date');

const { PRODUCT } = CONSTANTS;

/**
 * Evaluates facility's exposure period in months.
 * If `Unissued` then guarantee month value is returned.
 * If `Issued` then cover start and end date difference in months.
 * @param {Object} facility Facility object
 * @param {String} dealType Deal type `GEF`, `BSS`, `EWCS`
 * @param {Object} FMR Facility master record object, particularly used for amendments. `null` as default when no argument is provided.
 * @returns {String} Exposure period in months as a `String`
 */
const getExposurePeriod = (facility, dealType, fmr = null) => {
  const { facilitySnapshot } = facility;
  let exposure = 0;

  // Facility amendment exposure calculation
  if (facility.amendment && fmr) {
    // De-structure object
    const { issueDate } = fmr;
    const { coverEndDate } = facility.amendment;
    // Format in YYYY-MM-DD format
    const startDate = formatTimestamp(issueDate);
    const endDate = formatTimestamp(coverEndDate);

    // Calculate the exposure period, with number of months rounded up
    const durationMonths = getMonthDifference(startDate, endDate);
    const offset = isSameDayOfMonth(startDate, endDate) ? 0 : 1;

    return String(durationMonths + offset);
  }

  // New facility exposure calculation
  const { exposurePeriodInMonths } = facility.tfm;
  const { hasBeenIssued } = facilitySnapshot;

  if (dealType === PRODUCT.TYPE.GEF) {
    // GEF
    const { monthsOfCover } = facilitySnapshot;

    exposure = hasBeenIssued ? exposurePeriodInMonths : monthsOfCover;
  } else if (dealType === PRODUCT.TYPE.BSS_EWCS) {
    // BSS/EWCS

    // If already calculated by TFM then return
    if (hasBeenIssued && exposurePeriodInMonths) {
      return String(exposurePeriodInMonths);
    }

    // If not already calculated
    const { requestedCoverStartDate, ukefGuaranteeInMonths } = facilitySnapshot;

    const coverStartDate = requestedCoverStartDate
      ? formatTimestamp(requestedCoverStartDate)
      : getDateStringFromYearMonthDay(
        formatYear(facilitySnapshot['requestedCoverStartDate-year']),
        facilitySnapshot['requestedCoverStartDate-month'],
        facilitySnapshot['requestedCoverStartDate-day'],
      );

    const coverEndDate = getDateStringFromYearMonthDay(
      formatYear(facilitySnapshot['coverEndDate-year']),
      facilitySnapshot['coverEndDate-month'],
      facilitySnapshot['coverEndDate-day'],
    );

    if ((!isDate(coverStartDate) || !isDate(coverEndDate)) && ukefGuaranteeInMonths) {
      exposure = ukefGuaranteeInMonths;
    }

    const durationMonths = getMonthDifference(coverStartDate, coverEndDate) + 1;
    const monthOffset = isSameDayOfMonth(coverStartDate, coverEndDate) ? -1 : 0;

    // Return `exposure` when `coverStartDate` and `coverEndDate` are null
    if (!durationMonths && !monthOffset) {
      return String(exposure);
    }

    exposure = durationMonths + monthOffset;
  }

  return String(exposure);
};

module.exports = getExposurePeriod;
