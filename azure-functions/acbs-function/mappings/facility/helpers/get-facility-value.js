const { to2Decimals } = require('../../../helpers/currency');

/**
 * Returns the facility value, if base currency then total facility value
 * else total GBP converted facility value. If `GBP` in multi-currency facilities
 * then facility value for specific GBP facility.
 * @param {object} facility Facility object
 * @param {string | boolean} baseCurrency Deal base currency
 * @returns {Float} Facility value
 */
const getFacilityValue = (facility, baseCurrency) => {
  const amount = baseCurrency || !facility.tfm.facilityValueInGBP ? facility.facilitySnapshot.value : facility.tfm.facilityValueInGBP;

  return to2Decimals(amount);
};

module.exports = getFacilityValue;
