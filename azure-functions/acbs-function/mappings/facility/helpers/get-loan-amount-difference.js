/**
 * Calculates amended facility loan amount difference between amended amount
 * and previous amount.
 * Due to Mulesoft API restriction a new amended UKEF exposure amount cannot
 * be send in a payload, instead difference between the amount is expected.
 * @param {Integer} ukefExposure UKEF Exposure
 * @param {Object} facilityMasterRecord Facility master record object
 * @returns {Integer} Loan amount difference, if null argument then returns `0`
 */
const getLoanAmountDifference = (ukefExposure, facilityMasterRecord) => {
  if (ukefExposure && facilityMasterRecord) {
    const { maximumLiability } = facilityMasterRecord;
    return ukefExposure - maximumLiability;
  }

  return 0;
};

module.exports = getLoanAmountDifference;
