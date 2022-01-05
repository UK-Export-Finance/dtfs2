const { formatDate } = require('../../../helpers/date');

/**
 * Evaluates the cover start date of a facility.
 * When the product is BSS/EWCS then requestedCoverStartDate
 * property is referred to else coverStartDate.
 * @param {Object} facility Deal's facility object
 * @param {Bool} formatted Return in YYYY-MM-DD date format
 * @returns {String} String Cover start date
 */
const getCoverStartDate = (facility, formatted) => {
  if (facility.facilitySnapshot.requestedCoverStartDate) {
    return facility.facilitySnapshot.requestedCoverStartDate;
  }

  return formatted
    ? formatDate(facility.facilitySnapshot.coverStartDate)
    : facility.facilitySnapshot.coverStartDate;
};

module.exports = getCoverStartDate;
