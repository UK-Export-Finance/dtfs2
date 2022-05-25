/* calculating exposure period based on Portal V2 algorithm */
const moment = require('moment');
const CONSTANTS = require('../../../constants');
const { formatYear, formatTimestamp } = require('../../../helpers/date');

/**
 * Evalutes facility's exposure period in months.
 * If `Unissued` then guarantee month value is returned.
 * If `Issued` then cover start and end date difference in months.
 * @param {Object} facility Facility object
 * @param {String} dealType Deal type `GEF`, `BSS`, `EWCS`
 * @returns {Integer} Exposure period in months
 */
const getExposurePeriod = (facility, dealType) => {
  const { facilitySnapshot } = facility;

  // GEF
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    const exposurePeriodInMonths = facility.tfm.exposurePeriodInMonths || 0;
    const monthsOfCover = facilitySnapshot.monthsOfCover || 0;
    const { hasBeenIssued } = facilitySnapshot;

    return hasBeenIssued ? exposurePeriodInMonths : monthsOfCover;
  }

  // BSS/EWCS
  if (facilitySnapshot) {
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

    if (!coverStartDate.isValid() || !coverEndDate.isValid()) {
      return Number(ukefGuaranteeInMonths) || 0;
    }

    const durationMonths = coverEndDate.diff(coverStartDate, 'months') + 1;
    const monthOffset = moment(coverStartDate).date() === moment(coverEndDate).date() ? -1 : 0;

    return durationMonths + monthOffset;
  }

  return 0;
};

module.exports = getExposurePeriod;
