const CONSTANTS = require('../../../constants');
const { to2Decimals } = require('../../../helpers/currency');

/**
 * Formats an amount with trailing two decimal points integer
 * @param {number} amount Amount with or without decimal points integers
 * @returns {number} Two decimal points formatted integer
 */
const decimalPoint = (amount) => {
  if (amount) {
    return to2Decimals(amount);
  }

  return amount;
};

const getInterestOrFeeRate = (facility) => {
  /**
   * Facility record update
   */
  if (facility.update) {
    return decimalPoint(facility.update.interestOrFeeRate);
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
