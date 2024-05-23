/* calculating exposure period based on Portal V2 algorithm */
const CONSTANTS = require('../../../constants');
const { isDate, formatYear, formatDate, getDateStringFromYearMonthDay, getInclusiveMonthDifference } = require('../../../helpers/date');

const { PRODUCT } = CONSTANTS;

/**
 * Evaluates facility's exposure period in months.
 * If `Unissued` then guarantee month value is returned.
 * If `Issued` then cover start and end date difference in months.
 * @param {object} facility Facility object
 * @param {string} dealType Deal type `GEF`, `BSS`, `EWCS`
 * @param {object | null} FMR Facility master record object, particularly used for amendments. `null` as default when no argument is provided.
 * @returns {string} Exposure period in months
 */
const getExposurePeriod = (facility, dealType, fmr = null) => {
  const { facilitySnapshot } = facility;

  // Facility amendment exposure calculation
  if (facility.amendment && fmr) {
    // De-structure object
    const { issueDate } = fmr;
    const { coverEndDate } = facility.amendment;
    // Format in YYYY-MM-DD format
    const startDate = formatDate(issueDate);
    const endDate = formatDate(coverEndDate);

    return String(getInclusiveMonthDifference(startDate, endDate));
  }

  // New facility exposure calculation
  const { exposurePeriodInMonths } = facility.tfm;
  const { hasBeenIssued } = facilitySnapshot;

  if (dealType === PRODUCT.TYPE.GEF) {
    // GEF
    const { monthsOfCover } = facilitySnapshot;

    return String(hasBeenIssued ? exposurePeriodInMonths : monthsOfCover);
  }
  // BSS/EWCS

  // If already calculated by TFM then return
  if (hasBeenIssued && exposurePeriodInMonths) {
    return String(exposurePeriodInMonths);
  }

  // If not already calculated
  const { requestedCoverStartDate, ukefGuaranteeInMonths } = facilitySnapshot;

  const coverStartDate = requestedCoverStartDate
    ? formatDate(requestedCoverStartDate)
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

  if (!isDate(coverStartDate) || !isDate(coverEndDate)) {
    return ukefGuaranteeInMonths ? String(ukefGuaranteeInMonths) : '0';
  }

  return String(getInclusiveMonthDifference(coverStartDate, coverEndDate));
};

module.exports = getExposurePeriod;
