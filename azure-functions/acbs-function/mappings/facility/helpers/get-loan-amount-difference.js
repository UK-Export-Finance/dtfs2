const CONSTANTS = require('../../../constants');

const { FACILITY } = CONSTANTS;

/**
 * Calculates amended facility loan amount difference between amended amount
 * and previous amount.
 * Due to Mulesoft API restriction a new amended UKEF exposure amount cannot
 * be send in a payload, instead difference between the amount is expected.
 *
 * `GEF` facilities type will return 10% of the difference.
 * `Bond` facility type will return the full difference.
 * @param {Integer} ukefExposure UKEF Exposure
 * @param {String} type Facility Type
 * @param {Object} facilityMasterRecord Facility master record object
 * @returns {Integer} Loan amount difference, if null argument then returns `0`
 */
const getLoanAmountDifference = (ukefExposure, type, facilityMasterRecord) => {
  if (ukefExposure && facilityMasterRecord) {
    const { maximumLiability } = facilityMasterRecord;
    const difference = ukefExposure - maximumLiability;

    // GEF Facility - 10% of difference
    if (type === FACILITY.FACILITY_TYPE.CASH || type === FACILITY.FACILITY_TYPE.CONTINGENT) {
      return difference * 0.1;
    }

    // Bond Facility - Full amount
    return difference;
  }

  return 0;
};

module.exports = getLoanAmountDifference;
