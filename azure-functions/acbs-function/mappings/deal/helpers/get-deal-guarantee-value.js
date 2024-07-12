const getDealValue = require('./get-deal-value');
const CONSTANTS = require('../../../constants');
const { to2Decimals } = require('../../../helpers/currency');

/**
 * Returns supply contract value if `BSS/EWCS` in native currency else deal value.
 * @param {Object} deal Deal object
 * @returns {Float} Deal guarantee value
 */
const getDealGuaranteeValue = (deal) =>
  deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.BSS_EWCS ? to2Decimals(deal.dealSnapshot.submissionDetails.supplyContractValue) : getDealValue(deal);

module.exports = getDealGuaranteeValue;
