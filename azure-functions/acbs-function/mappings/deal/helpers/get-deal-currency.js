const CONSTANTS = require('../../../constants');
const { getBaseCurrency } = require('../../facility/helpers');

/**
 * Evaluates deal's currency.
 * `GEF`, `BSS`, `EWCS` = Base currency else `GBP`
 * @param {object} deal Deal currency
 * @returns {string} Currency ID `GBP`, `USD` else `GBP`
 */
const getDealCurrency = (deal) => getBaseCurrency(deal.dealSnapshot.facilities) || CONSTANTS.DEAL.CURRENCY.DEFAULT;

module.exports = getDealCurrency;
