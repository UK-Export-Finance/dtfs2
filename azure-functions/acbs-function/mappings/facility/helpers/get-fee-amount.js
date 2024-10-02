const CONSTANTS = require('../../../constants');
const { to2Decimals } = require('../../../helpers/currency');

/**
 * Return facility fee record amount.
 * @param {Object} facility Facility object
 * @param {string} dealType Deal type i.e. GEF, BSS, EWCS
 * @param {number} premiumScheduleIndex Premium schedule index
 * @returns {number} Fee record amount
 */

const getFeeAmount = (facility, dealType, premiumScheduleIndex) => {
  // GEF
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return to2Decimals(facility.tfm.feeRecord);
  }

  // EWCS/BSS
  return facility.tfm.premiumSchedule[premiumScheduleIndex] ? to2Decimals(facility.tfm.premiumSchedule[premiumScheduleIndex].income) : 0;
};

module.exports = getFeeAmount;
