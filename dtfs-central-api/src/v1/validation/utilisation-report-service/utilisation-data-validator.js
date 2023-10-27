const validator = require('validator');
const REGEXES = require('../../../constants/regex');

/**
 * Validates the UKEF ID to match the UKEF facility ID regex, returns an error message or null if valid.
 * @param {Integer | String | null} ukefId - ukef facility ID.
 * @returns {String | null} - Error message or null if valid.
 */
const validateUkefId = (ukefId) => {
  if (ukefId) {
    if (!ukefId.toString().match(REGEXES.UKEF_FACILITY_ID_REGEX)) {
      return 'UKEF ID must be an 8 digit number';
    }
  }
  return null;
};

/**
 * Validates the exporter to be a string, returns an error message or null if valid.
 * @param {String | null} exporter - exporter of the facility.
 * @returns {String | null} - Error message or null if valid.
 */
const validateExporter = (exporter) => {
  if (exporter) {
    if (typeof exporter !== 'string') {
      return 'Exporter must be a string';
    }
  }
  return null;
};

/**
 * Validates the base currency to be an ISO 4217 currency code, returns an error message or null if valid.
 * @param {String | null} baseCurrency - base currency of the facility.
 * @returns {String | null} - Error message or null if valid.
 */
const validateBaseCurrency = (baseCurrency) => {
  if (baseCurrency) {
    if (!validator.isISO4217(baseCurrency.toString())) {
      return 'Base currency must be an ISO 4217 currency code';
    }
  }
  return null;
};

/**
 * Validates the facility utilisation to be a monetary value, returns an error message or null if valid.
 * @param {String | Integer | null} facilityUtilisation - utilisation of the facility.
 * @returns {String | null} - Error message or null if valid.
 */
const validateFacilityUtilisation = (facilityUtilisation) => {
  if (facilityUtilisation) {
    if (!facilityUtilisation.toString().match(REGEXES.CURRENCY_NUMBER_REGEX)) {
      return 'Facility utilisation must be a monetary value';
    }
  }
  return null;
};

/**
 * Validates the total fees accrued to be a monetary value, returns an error message or null if valid.
 * @param {String | Integer | null} totalFeesAccrued
 * @returns {String | null} - Error message or null if valid.
 */
const validateTotalFeesAccrued = (totalFeesAccrued) => {
  if (totalFeesAccrued) {
    if (!totalFeesAccrued.toString().match(REGEXES.CURRENCY_NUMBER_REGEX)) {
      return 'Total fees accrued must be a monetary value';
    }
  }
  return null;
};

/**
 * Validates the monthly fees paid to be a monetary value, returns an error message or null if valid.
 * @param {String | Integer | null} monthlyFeesPaid
 * @returns {String | null} - Error message or null if valid.
 */
const validateMonthlyFeesPaid = (monthlyFeesPaid) => {
  if (monthlyFeesPaid) {
    if (!monthlyFeesPaid.toString().match(REGEXES.CURRENCY_NUMBER_REGEX)) {
      return 'Monthly fees paid must be a monetary value';
    }
  }
  return null;
};

/**
 * Validates the payment currency to be an ISO 4217 currency code, returns an error message or null if valid.
 * @param {String | null} paymentCurrency - payment currency of the facility.
 * @returns {String | null} - Error message or null if valid.
 */
const validatePaymentCurrency = (paymentCurrency) => {
  if (paymentCurrency) {
    if (!validator.isISO4217(paymentCurrency.toString())) {
      return 'Payment currency must be an ISO 4217 currency code';
    }
  }
  return null;
};

/**
 * Validates the exchange rate, returns an error message or null if valid.
 * @param {String | Integer | null} exchangeRate - exchange rate at payment date.
 * @returns {String | null} - Error message or null if valid.
 */
const validateExchangeRate = (exchangeRate) => {
  if (exchangeRate) {
    if (!exchangeRate.toString().match(REGEXES.EXCHANGE_RATE_REGEX)) {
      return 'Exchange rate must be a number representing an exchange rate';
    }
  }
  return null;
};

module.exports = {
  validateUkefId,
  validateExporter,
  validateBaseCurrency,
  validateFacilityUtilisation,
  validateTotalFeesAccrued,
  validateMonthlyFeesPaid,
  validatePaymentCurrency,
  validateExchangeRate,
};
