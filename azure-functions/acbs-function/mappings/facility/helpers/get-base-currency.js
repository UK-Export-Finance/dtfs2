/**
 * Returns the base currency amongst all the deal's facilities
 * @param {Object} facilities Facility object
 * @returns {String | Boolean} Currency ID `GBP`, `USD` else `false` as Boolean.
 */
const getBaseCurrency = (facilities) => facilities.reduce((currency, facility) =>
  (facility.facilitySnapshot.currency.id === currency ? currency : false), facilities[0].facilitySnapshot.currency.id);

module.exports = getBaseCurrency;
