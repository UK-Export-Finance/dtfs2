const CONSTANTS = require('../../../constants');

/**
 * `GEF` = 10% of amount.
 * `Loan` or `Bond` = amount
 * @param {Float} amount Facility UKEF exposure
 * @param {Object} facility Facility
 * @param {Object} dealType Deal type
 */
const getLoanMaximumLiability = (amount, facility, dealType) => {
  const ukefExposure = dealType === CONSTANTS.PRODUCT.TYPE.GEF
    ? amount * 0.10 // GEF
    : amount; // BSS/EWCS

  return Number(Number(ukefExposure).toFixed(2));
};

module.exports = getLoanMaximumLiability;
