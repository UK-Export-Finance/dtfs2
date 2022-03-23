const mapFeeFrequency = require('./map-fee-frequency');
const mapFeeType = require('./map-fee-type');
const CONSTANTS = require('../../../constants');

/**
 * Fee frequency for the facility, if `At Maturity` then `Annually` else respective fee frequency code.
 * @param {Object} facilitySnapshot Facility snapshot object
 * @returns {String} Fee-frequency ACBS code
 */
const getPremiumFrequencyCode = (facilitySnapshot) => {
  const feeFrequency = mapFeeFrequency(facilitySnapshot);
  const feeType = mapFeeType(facilitySnapshot);

  if (feeType === CONSTANTS.FACILITY.FEE_TYPE.AT_MATURITY) {
    return CONSTANTS.FACILITY.MASTER_FACILITY_FEE_FREQUENCY_ACBS_CODE.ANNUALLY;
  }

  switch (feeFrequency) {
    case CONSTANTS.FACILITY.FEE_FREQUENCY.MONTHLY:
      return CONSTANTS.FACILITY.MASTER_FACILITY_FEE_FREQUENCY_ACBS_CODE.MONTHLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.QUARTERLY:
      return CONSTANTS.FACILITY.MASTER_FACILITY_FEE_FREQUENCY_ACBS_CODE.QUARTERLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.SEMI_ANNUALLY:
      return CONSTANTS.FACILITY.MASTER_FACILITY_FEE_FREQUENCY_ACBS_CODE.SEMI_ANNUALLY;

    case CONSTANTS.FACILITY.FEE_FREQUENCY.ANNUALLY:
      return CONSTANTS.FACILITY.MASTER_FACILITY_FEE_FREQUENCY_ACBS_CODE.ANNUALLY;

    default:
      return CONSTANTS.FACILITY.MASTER_FACILITY_FEE_FREQUENCY_ACBS_CODE.ANNUALLY;
  }
};

module.exports = getPremiumFrequencyCode;
