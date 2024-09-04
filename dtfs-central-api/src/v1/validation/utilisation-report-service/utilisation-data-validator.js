import validator from 'validator';
import { REGEX } from '../../../constants';

/**
 * @typedef {import('./utilisation-data-validator.types').UtilisationDataValidatorError} UtilisationDataValidatorError
 */

/**
 * Validates the UKEF ID to match the UKEF facility ID regex or be falsey, returns an error message or null if valid.
 * @param {unknown} ukefId - ukef facility ID.
 * @param {number} index - index of the facility in the array.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateUkefId = (ukefId, index) => {
  if (ukefId) {
    if (!ukefId.toString().match(REGEX.UKEF_FACILITY_ID_REGEX)) {
      return { index, error: 'UKEF ID must be a string of 8-10 digits' };
    }
  }
  return null;
};

/**
 * Validates the exporter to be a string or be falsey, returns an error message or null if valid.
 * @param {unknown} exporter - exporter of the facility.
 * @param {number} index - index of the facility in the array.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateExporter = (exporter, index) => {
  if (exporter) {
    if (typeof exporter !== 'string') {
      return { index, error: 'Exporter must be a string' };
    }
  }
  return null;
};

/**
 * Validates the value to be valid monetary value or be falsey, returns an error message or null if valid.
 * @param {unknown} monetaryValue - the monetary value to check
 * @param {number} index - index of the facility in the array.
 * @param {string} fieldName - name of field appearing in error message.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateMonetaryValue = (monetaryValue, index, fieldName) => {
  if (monetaryValue) {
    if (!monetaryValue.toString().match(REGEX.CURRENCY_NUMBER_REGEX)) {
      return { index, error: `${fieldName} must be a monetary value` };
    }
  }
  return null;
};

/**
 * Validates the currency to be an ISO 4217 currency code or be falsey, returns an error message or null if valid.
 * @param {unknown} currencyValue - the currency code to check
 * @param {number} index - index of the facility in the array.
 * @param {string} fieldName - name of field appearing in error message.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateCurrencyValue = (currencyValue, index, fieldName) => {
  if (currencyValue) {
    if (!validator.isISO4217(currencyValue.toString())) {
      return { index, error: `${fieldName} must be an ISO 4217 currency code` };
    }
  }
  return null;
};

/**
 * Validates the exchange rate to be a number or be falsey, returns an error message or null if valid.
 * @param {unknown} exchangeRate - exchange rate at payment date.
 * @param {number} index - index of the facility in the array.
 * @param {string} fieldName - name of field appearing in error message.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateExchangeRate = (exchangeRate, index, fieldName) => {
  if (exchangeRate) {
    if (!exchangeRate.toString().match(REGEX.EXCHANGE_RATE_REGEX)) {
      return { index, error: `${fieldName} must be a number representing an exchange rate` };
    }
  }
  return null;
};

/**
 * Validates the facility utilisation to be a monetary value or be falsey, returns an error message or null if valid.
 * @param {unknown} facilityUtilisation - utilisation of the facility.
 * @param {number} index - index of the facility in the array.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateFacilityUtilisation = (facilityUtilisation, index) => validateMonetaryValue(facilityUtilisation, index, 'Facility utilisation');

/**
 * Validates the total fees accrued to be a monetary value or be falsey, returns an error message or null if valid.
 * @param {string | number | null} totalFeesAccrued
 * @param {number} index - index of the facility in the array.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateTotalFeesAccrued = (totalFeesAccrued, index) => validateMonetaryValue(totalFeesAccrued, index, 'Total fees accrued');

/**
 * Validates the total fees accrued currency to be an ISO 4217 currency code or be falsey, returns an error message or null if valid.
 * @param {unknown} totalFeesAccruedCurrency - total fees accrued currency of the facility.
 * @param {number} index - index of the facility in the array.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateTotalFeesAccruedCurrency = (totalFeesAccruedCurrency, index) =>
  validateCurrencyValue(totalFeesAccruedCurrency, index, 'Total fees accrued currency');

/**
 * Validates the total fees accrued exchange rate to be a number or be falsey, returns an error message or null if valid.
 * @param {unknown} totalFeesAccruedExchangeRate - total fees accrued exchange rate of the facility.
 * @param {number} index - index of the facility in the array.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateTotalFeesAccruedExchangeRate = (totalFeesAccruedExchangeRate, index) =>
  validateExchangeRate(totalFeesAccruedExchangeRate, index, 'Total fees accrued exchange rate');

/**
 * Validates the monthly fees paid to be a monetary value or be falsey, returns an error message or null if valid.
 * @param {unknown} monthlyFeesPaid
 * @param {number} index - index of the facility in the array.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateMonthlyFeesPaid = (monthlyFeesPaid, index) => validateMonetaryValue(monthlyFeesPaid, index, 'Monthly fees paid');

/**
 * Validates the monthly fees paid currency to be an ISO 4217 currency code or be falsey, returns an error message or null if valid.
 * @param {unknown} monthlyFeesPaidCurrency - monthly fees paid currency of the facility.
 * @param {number} index - index of the facility in the array.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateMonthlyFeesPaidCurrency = (monthlyFeesPaidCurrency, index) => validateCurrencyValue(monthlyFeesPaidCurrency, index, 'Monthly fees paid currency');

/**
 * Validates the payment currency to be an ISO 4217 currency code or be falsey, returns an error message or null if valid.
 * @param {unknown} paymentCurrency - payment currency of the facility.
 * @param {number} index - index of the facility in the array.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validatePaymentCurrency = (paymentCurrency, index) => validateCurrencyValue(paymentCurrency, index, 'Payment currency');

/**
 * Validates the base currency to be an ISO 4217 currency code or be falsey, returns an error message or null if valid.
 * @param {unknown} baseCurrency - base currency of the facility.
 * @param {number} index - index of the facility in the array.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validateBaseCurrency = (baseCurrency, index) => validateCurrencyValue(baseCurrency, index, 'Base currency');

/**
 * Validates the payment exchange rate to be a number or be falsey, returns an error message or null if valid.
 * @param {unknown} paymentCurrencyExchangeRate - payment currency exchange rate of the facility.
 * @param {number} index - index of the facility in the array.
 * @returns {UtilisationDataValidatorError | null} - Error message or null if valid.
 */
const validatePaymentExchangeRate = (paymentCurrencyExchangeRate, index) => validateExchangeRate(paymentCurrencyExchangeRate, index, 'Payment exchange rate');

export {
  validateUkefId,
  validateExporter,
  validateBaseCurrency,
  validateFacilityUtilisation,
  validateTotalFeesAccrued,
  validateTotalFeesAccruedCurrency,
  validateTotalFeesAccruedExchangeRate,
  validateMonthlyFeesPaid,
  validateMonthlyFeesPaidCurrency,
  validatePaymentCurrency,
  validatePaymentExchangeRate,
};
