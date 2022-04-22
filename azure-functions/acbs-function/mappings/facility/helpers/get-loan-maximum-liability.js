const CONSTANTS = require('../../../constants');

/**
 * `GEF` = 10% of amount
 * `Loan` (EWCS) = Disbursement amount
 * `Bond` (BSS) = Amount
 * @param {Float} amount Facility UKEF exposure
 * @param {Object} facility Facility
 * @param {Object} dealType Deal type
 */
const getLoanMaximumLiability = (amount, facility, dealType) => {
  let ukefExposure;

  // GEF
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    ukefExposure = amount * 0.10;
  } else {
  // BSS/EWCS
    ukefExposure = facility.facilitySnapshot.type === CONSTANTS.FACILITY.FACILITY_TYPE.LOAN
      ? facility.facilitySnapshot.disbursementAmount // EWCS
      : amount; // BSS
  }

  return Number(Number(ukefExposure).toFixed(2));
};

module.exports = getLoanMaximumLiability;
