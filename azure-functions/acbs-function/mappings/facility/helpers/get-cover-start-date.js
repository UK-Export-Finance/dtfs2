const { formatDate } = require('../../../helpers/date');

/**
 * Formatted EPOCH, if `fromEpoch` set to true else returns the input.
 * @param {string} epoch EPOCH
 * @param {boolean} fromEpoch Format timestamp
 * @returns {string} Formatted timestamp if true
 */
const format = (epoch, fromEpoch) => (fromEpoch ? formatDate(epoch) : epoch);

/**
 * Evaluates the cover start date of a facility.
 * When the product is BSS/EWCS then requestedCoverStartDate
 * property is referred to else coverStartDate.
 * @param {Object} facility Deal's facility object
 * @param {bool} formatted Return in YYYY-MM-DD date format
 * @returns {string} String Cover start date
 */
const getCoverStartDate = (facility, formatted) => {
  if (facility.facilitySnapshot) {
    return facility.facilitySnapshot.requestedCoverStartDate
      ? facility.facilitySnapshot.requestedCoverStartDate
      : format(facility.facilitySnapshot.coverStartDate, formatted);
  }
  return facility.requestedCoverStartDate ? facility.requestedCoverStartDate : format(facility.coverStartDate, formatted);
};

module.exports = getCoverStartDate;
