const {
  getFacilityValue,
  getBaseCurrency,
} = require('../../facility/helpers');

/**
 * Return deal's total facilities amount.
 * @param {Object} deal Deal Obkect
 * @returns {Float} Deal value
 */
const getDealValue = (deal) => {
  const currency = getBaseCurrency(deal.dealSnapshot.facilities);
  return deal.dealSnapshot.facilities.reduce((total, facility) => total + getFacilityValue(facility, currency), 0);
};

module.exports = getDealValue;
