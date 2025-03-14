const mapFeeFrequency = require('./map-fee-frequency');
const CONSTANTS = require('../../../constants');

/**
 * Return ACBS field code for facility fee frequency.
 * @param {Object} facility Facility object
 * @returns {string} ACBS day basis code
 */
const getFeeFrequency = (facility) => {
  const feeFrequency = mapFeeFrequency(facility.facilitySnapshot);

  switch (feeFrequency) {
    case CONSTANTS.FACILITY.FEE_FREQUENCY.WEEKLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_ACBS_CODE.WEEKLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.BI_WEEKLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_ACBS_CODE.BI_WEEKLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.MONTHLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_ACBS_CODE.MONTHLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.BI_MONTHLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_ACBS_CODE.BI_MONTHLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.QUARTERLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_ACBS_CODE.QUARTERLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.SEMI_ANNUALLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_ACBS_CODE.SEMI_ANNUALLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.ANNUALLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_ACBS_CODE.ANNUALLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.BI_ANNUALLY:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_ACBS_CODE.BI_ANNUALLY;

    default:
      return CONSTANTS.FACILITY.FEE_FREQUENCY_ACBS_CODE.ANNUALLY;
  }
};

module.exports = getFeeFrequency;
