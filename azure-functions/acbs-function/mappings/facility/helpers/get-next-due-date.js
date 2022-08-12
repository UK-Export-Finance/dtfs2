const CONSTANTS = require('../../../constants');
const getFeeFrequencyMonths = require('./get-fee-frequency-months');
const { addMonth } = require('../../../helpers/date');
const mapFeeType = require('./map-fee-type');

const { FACILITY } = CONSTANTS;

/**
 * Return facility next due date.
 * @param {Object} facility Facility object
 * @returns {Date} Facility due date in YYYY-MM-DD format
 */

const getNextDueDate = (facility) => {
  const { guaranteeCommencementDate, guaranteeExpiryDate } = facility.tfm.facilityGuaranteeDates
    ? facility.tfm.facilityGuaranteeDates
    : facility.update;
  const months = getFeeFrequencyMonths(facility);
  const feeType = mapFeeType(facility.facilitySnapshot);

  if (feeType === FACILITY.FEE_TYPE.AT_MATURITY) {
    return guaranteeExpiryDate;
  }

  return addMonth(guaranteeCommencementDate, months);
};

module.exports = getNextDueDate;
