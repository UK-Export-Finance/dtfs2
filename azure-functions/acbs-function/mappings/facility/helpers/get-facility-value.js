/**
 * Returns the facility value, if base currency then total facility value
 * else total GBP converted facility value.
 * @param {Object} facility Facility object
 * @param {String | Boolean} baseCurrency Deal base currency
 * @returns {Float} Facility value
 */
const getFacilityValue = (facility, baseCurrency) => {
  const amount = baseCurrency
    ? facility.facilitySnapshot.value
    : facility.tfm.facilityValueInGBP;

  return Number(Number(amount).toFixed(2));
};

module.exports = getFacilityValue;
