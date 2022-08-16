/* calculating exposure period based on Portal V2 algorithm */
const moment = require('moment');
const CONSTANTS = require('../../../constants');
const { formatYear, formatTimestamp } = require('../../../helpers/date');

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
    let exposurePeriod = moment(endDate).diff(moment(startDate), 'months') + 1;
    // Month offset
    const offset = moment(startDate).date() === moment(endDate).date() ? -1 : 0;
    exposurePeriod += offset;

    return String(exposurePeriod);
  }

  // New facility exposure calculation
  if (dealType === PRODUCT.TYPE.GEF) {
    // GEF
    const { exposurePeriodInMonths } = facility.tfm;
    const { hasBeenIssued, monthsOfCover } = facilitySnapshot;

    exposure = hasBeenIssued ? exposurePeriodInMonths : monthsOfCover;
  } else if (dealType === PRODUCT.TYPE.BSS_EWCS) {
    // BSS/EWCS
    let coverStartDate;
    const {
      requestedCoverStartDate,
      ukefGuaranteeInMonths,
    } = facilitySnapshot;

    if (requestedCoverStartDate) {
      const startDate = moment(formatTimestamp(requestedCoverStartDate));

      coverStartDate = moment([
        formatYear(startDate.year()),
        startDate.month(),
        startDate.date(),
      ]);
    } else {
      coverStartDate = moment([
        formatYear(facilitySnapshot['requestedCoverStartDate-year']),
        facilitySnapshot['requestedCoverStartDate-month'] - 1,
        facilitySnapshot['requestedCoverStartDate-day'],
      ]);
    }

    const coverEndDate = moment([
      formatYear(facilitySnapshot['coverEndDate-year']),
      facilitySnapshot['coverEndDate-month'] - 1,
      facilitySnapshot['coverEndDate-day'],
    ]);

    if ((!coverStartDate.isValid() || !coverEndDate.isValid()) && ukefGuaranteeInMonths) {
      exposure = ukefGuaranteeInMonths;
    }

    const durationMonths = coverEndDate.diff(coverStartDate, 'months') + 1;
    const monthOffset = moment(coverStartDate).date() === moment(coverEndDate).date() ? -1 : 0;

    exposure = durationMonths + monthOffset;
  }

  return String(exposure);
};

module.exports = getExposurePeriod;
