const validator = require('validator');
const REGEXES = require('../../../constants/regex');

const validateUkefId = (ukefId) => {
  if (ukefId) {
    if (!ukefId.toString().match(REGEXES.UKEF_FACILITY_ID_REGEX)) {
      return 'UKEF ID must be an 8 digit number';
    }
  }
  return null;
};

const validateExporter = (exporter) => {
  if (exporter) {
    if (typeof exporter !== 'string') {
      return 'Exporter must be a string';
    }
  }
  return null;
};

const validateBaseCurrency = (baseCurrency) => {
  if (baseCurrency) {
    if (!validator.isISO4217(baseCurrency.toString())) {
      return 'Base currency must be an ISO 4217 currency code';
    }
  }
  return null;
};

const validateFacilityUtilisation = (facilityUtilisation) => {
  if (facilityUtilisation) {
    if (!facilityUtilisation.toString().match(REGEXES.CURRENCY_NUMBER_REGEX)) {
      return 'Facility utilisation must be a monetary value';
    }
  }
  return null;
};

const validateTotalFeesAccrued = (totalFeesAccrued) => {
  if (totalFeesAccrued) {
    if (!totalFeesAccrued.toString().match(REGEXES.CURRENCY_NUMBER_REGEX)) {
      return 'Total fees accrued must be a monetary value';
    }
  }
  return null;
};

const validateMonthlyFeesPaid = (monthlyFeesPaid) => {
  if (monthlyFeesPaid) {
    if (!monthlyFeesPaid.toString().match(REGEXES.CURRENCY_NUMBER_REGEX)) {
      return 'Monthly fees paid must be a monetary value';
    }
  }
  return null;
};

const validatePaymentCurrency = (paymentCurrency) => {
  if (paymentCurrency) {
    if (!validator.isISO4217(paymentCurrency.toString())) {
      return 'Payment currency must be an ISO 4217 currency code';
    }
  }
  return null;
};

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
