const CONSTANTS = require('../../../constants');
const getGefFacilityPercentage = require('./get-gef-facility-fixed-percentage');

const { FACILITY } = CONSTANTS;

/**
 * Calculates amended facility loan amount difference between amended amount
 * and previous amount.
 * Due to APIM API restriction a new amended UKEF exposure amount cannot
 * be send in a payload, instead difference between the amount is expected.
 *
 * `GEF` =  70% for `Contingent` and 85% for `Cash` facilities, unless specified otherwise from an enviornment variable.
 * `Bond` facility type will return the full difference.
 * @param {number} ukefExposure UKEF Exposure
 * @param {string} type Facility Type
 * @param {Object} facilityMasterRecord Facility master record object
 * @returns {number} Loan amount difference, if null argument then returns `0`
 */
const getLoanAmountDifference = (ukefExposure, type, facilityMasterRecord) => {
  if (ukefExposure && facilityMasterRecord) {
    const { maximumLiability } = facilityMasterRecord;
    const difference = ukefExposure - maximumLiability;

    // GEF facilities
    if (type === FACILITY.FACILITY_TYPE.CASH || type === FACILITY.FACILITY_TYPE.CONTINGENT) {
      return difference * getGefFacilityPercentage(type);
    }

    // Bond and loan Facilities - Full amount
    return difference;
  }

  return 0;
};

module.exports = getLoanAmountDifference;
