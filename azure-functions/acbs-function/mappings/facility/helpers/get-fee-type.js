const CONSTANTS = require('../../../constants');
const getFeeFrequency = require('./get-fee-frequency');
const mapFeeType = require('./map-fee-type');

/**
 * Return ACBS field code for facility fee type.
 * Same ACBS code as fee frequency apart from `At Maturity`.
 * @param {Object} facility Facility object
 * @returns {string} ACBS fee type code
 */
const getFeeType = (facility) => {
  const feeType = mapFeeType(facility.facilitySnapshot);

  return feeType === CONSTANTS.FACILITY.FEE_TYPE.AT_MATURITY ? CONSTANTS.FACILITY.FEE_TYPE_ACBS_CODE.AT_MATURITY : getFeeFrequency(facility);
};

module.exports = getFeeType;
