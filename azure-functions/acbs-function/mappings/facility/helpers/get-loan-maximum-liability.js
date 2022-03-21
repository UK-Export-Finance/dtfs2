const CONSTANTS = require('../../../constants');

/**
 * `GEF` = 10% of amount.
 * `Loan` = disbursement amount, else `amount`.
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
      ? facility.facilitySnapshot.disbursementAmount
      : amount;
  }

  return Number(Number(ukefExposure).toFixed(2));
};

module.exports = getLoanMaximumLiability;
