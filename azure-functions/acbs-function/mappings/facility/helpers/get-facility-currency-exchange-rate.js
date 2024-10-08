/**
 * Return facility's curency exchange rate when facility
 * currency is not in GBP
 * @param {object} facility Facility object
 * @returns {number} Facility exchange rate
 */
const getCurrencyExchangeRate = (facility) => Number(facility.tfm.exchangeRate.toFixed(4));

module.exports = getCurrencyExchangeRate;
