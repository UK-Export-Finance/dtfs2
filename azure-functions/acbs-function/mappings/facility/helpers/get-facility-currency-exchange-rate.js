/**
 * Return facility's curency exchange rate when facility
 * currency is not in GBP
 * @param {Object} facility Facility object
 * @returns {Integer} Facility exchange rate
 */
const getCurrencyExchangeRate = (facility) => Number(facility.tfm.exchangeRate.toFixed(4));

module.exports = getCurrencyExchangeRate;
