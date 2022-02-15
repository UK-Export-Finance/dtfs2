const CONSTANTS = require('../../../constants');

/**
 * Return facility fee record amount.
 * @param {Object} facility Facility object
 * @param {String} dealType Deal type i.e. GEF, BSS, EWCS
 * @param {Integer} premiumScheduleIndex Premium schedule index
 * @returns {Integer} Fee record amount
 */

const getFeeAmount = (facility, dealType, premiumScheduleIndex) => {
  // GEF
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return Number(facility.tfm.feeRecord.toFixed(2));
  }

  // EWCS/BSS
  return facility.tfm.premiumSchedule[premiumScheduleIndex]
    ? Number(facility.tfm.premiumSchedule[premiumScheduleIndex].income.toFixed(2))
    : 0;
};

module.exports = getFeeAmount;
