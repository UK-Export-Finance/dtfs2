const mapFeeFrequency = require('./map-fee-frequency');
const CONSTANTS = require('../../../constants');

/**
 * Returns numerical months from facility's fee frequency.
 * @param {Object} facility Facility object
 * @returns {Integer} Number of months
 */
const getFeeFrequencyMonths = (facility) => {
  const feeFrequency = mapFeeFrequency(facility.facilitySnapshot);

  switch (feeFrequency) {
    case CONSTANTS.FACILITY.FEE_FREQUENCY.MONTHLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_NUMERICAL_VALUE.MONTHLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.QUARTERLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_NUMERICAL_VALUE.QUARTERLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.SEMI_ANNUALLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_NUMERICAL_VALUE.SEMI_ANNUALLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.ANNUALLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_NUMERICAL_VALUE.ANNUALLY;

    default:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_NUMERICAL_VALUE.ANNUALLY;
  }
};

module.exports = getFeeFrequencyMonths;
