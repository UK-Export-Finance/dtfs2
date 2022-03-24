const getDealValue = require('./get-deal-value');
const CONSTANTS = require('../../../constants');

/**
 * Returns supply contract value if `BSS/EWCS` in native currency else deal value.
 * @param {Object} deal Deal object
 * @returns {Float} Deal guarantee value
 */
const getDealGuaranteeValue = (deal) => (
  deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.BSS_EWCS
    ? Number(Number(deal.dealSnapshot.submissionDetails.supplyContractValue).toFixed(2))
    : getDealValue(deal)
);

module.exports = getDealGuaranteeValue;
