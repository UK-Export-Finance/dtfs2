const CONSTANTS = require('../../../constants');

/**
 * Return facility fee record period
 * @param {Object} facility Facility object
 * @param {string} dealType Deal type i.e. GEF, BSS, EWCS
 * @param {number} premiumScheduleIndex Premium schedule index
 * @returns {string} Facility fee record period, padded with leading `0` if single digit.
 */
const getFeeRecordPeriod = (facility, dealType, premiumScheduleIndex) => {
  // GEF
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return '01';
  }
  // EWCS/BSS
  return facility.tfm.premiumSchedule[premiumScheduleIndex] ? facility.tfm.premiumSchedule[premiumScheduleIndex].period.toString().padStart(2, 0) : '01';
};

module.exports = getFeeRecordPeriod;
