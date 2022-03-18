const {
  getFacilityValue,
  getBaseCurrency,
} = require('../../facility/helpers');

/**
 * Returns total of deal's facilities amount.
 * @param {Object} deal Deal Obkect
 * @returns {Float} amount Deal value
 */
const getDealValue = (deal) => {
  const currency = getBaseCurrency(deal.dealSnapshot.facilities);
  return deal.dealSnapshot.facilities.reduce((total, facility) => total + getFacilityValue(facility, currency), 0);
};

module.exports = getDealValue;
