const CONSTANTS = require('../../../constants');
const { getBaseCurrency } = require('../../facility/helpers');

/**
 * Evaluates deal's currency.
 * `GEF` = Base currency else `GBP`
 * `BSS/EWCS`= Base currency else `GBP`
 * @param {Object} deal Deal currency
 * @returns {String} Currency ID `GBP`, `USD`.
 */
const getDealCurrency = (deal) => {
  const currency = getBaseCurrency(deal.dealSnapshot.facilities);
  return currency || CONSTANTS.DEAL.CURRENCY.DEFAULT;
};

module.exports = getDealCurrency;
