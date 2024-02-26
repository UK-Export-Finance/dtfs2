/* calculating exposure period based on Portal V2 algorithm */
const moment = require('moment');
const CONSTANTS = require('../../../constants');
const { formatYear, formatTimestamp, getMonthDifference, isSameDayOfMonth, getMomentFromYearMonthDay } = require('../../../helpers/date');

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

    // Calculate exposure period (+1 for inclusive calculation)
    let exposurePeriod = getMonthDifference(startDate, endDate) + 1;
    // Month offset
    const offset = isSameDayOfMonth(startDate, endDate) ? -1 : 0;
    exposurePeriod += offset;

    return String(exposurePeriod);
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
      ? moment(formatTimestamp(requestedCoverStartDate))
      : getMomentFromYearMonthDay(
        formatYear(facilitySnapshot['requestedCoverStartDate-year']),
        facilitySnapshot['requestedCoverStartDate-month'],
        facilitySnapshot['requestedCoverStartDate-day'],
      );

    const coverEndDate = getMomentFromYearMonthDay(
      formatYear(facilitySnapshot['coverEndDate-year']),
      facilitySnapshot['coverEndDate-month'],
      facilitySnapshot['coverEndDate-day'],
    );

    if ((!coverStartDate.isValid() || !coverEndDate.isValid()) && ukefGuaranteeInMonths) {
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
