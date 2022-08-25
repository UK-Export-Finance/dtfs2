const CONSTANTS = require('../../../constants');

/**
 * Formats an amount with trailing two decimal points integer
 * @param {Integer} amount Amount with or without decimal points integers
 * @returns {Integer} Two decimal points formatted integer
 */
const decimalPoint = (amount) => {
  if (amount) {
    return Number(Number(amount).toFixed(2));
  }

  return amount;
};

const getInterestOrFeeRate = (facility) => {
  /**
   * Facility record update
   */
  if (facility.update) {
    return decimalPoint(facility.update.intrestOrFeeRate);
  }

  /**
   * Facility record creation
   */
  // GEF
  if (facility.facilitySnapshot.interestPercentage) {
    return decimalPoint(facility.facilitySnapshot.interestPercentage);
  }

  // EWCS/BSS
  switch (facility.facilitySnapshot.type) {
    case CONSTANTS.FACILITY.FACILITY_TYPE.BOND:
      return decimalPoint(facility.facilitySnapshot.riskMarginFee);

    case CONSTANTS.FACILITY.FACILITY_TYPE.LOAN:
      return decimalPoint(facility.facilitySnapshot.interestMarginFee);

    default:
      return 0;
  }
};

module.exports = getInterestOrFeeRate;
