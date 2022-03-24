const CONSTANTS = require('../../../constants');

/**
 * Return ACBS field code for facility day count basis.
 * Defaults to 365 or ACBS code `1`.
 * @param {Object} facility Facility object
 * @returns {String} ACBS day basis code
 */

const getYearBasis = (facility) => {
  switch (Number(facility.facilitySnapshot.dayCountBasis)) {
    case 360:
      return CONSTANTS.FACILITY.DAY_COUNT_BASIS[360];
    case 365:
      return CONSTANTS.FACILITY.DAY_COUNT_BASIS[365];
    default:
      return '1';
  }
};

module.exports = getYearBasis;
