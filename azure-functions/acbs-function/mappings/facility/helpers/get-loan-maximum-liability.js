const CONSTANTS = require('../../../constants');

/**
 * Returns `10%` of amount, if the `GEF` deal.
 * @param {Float} amount Facility UKEF exposure
 * @param {Object} dealType Deal type
 */
const getLoanMaximumLiability = (amount, dealType) => (
  dealType === CONSTANTS.PRODUCT.TYPE.GEF
    ? amount * 0.10
    : amount
);

module.exports = getLoanMaximumLiability;
