const { generateUkefFacilityIdError } = require('./generate-ukef-facility-id-error');
const { generateBaseCurrencyError } = require('./generate-base-currency-error');
const { generateFacilityUtilisationError } = require('./generate-facility-utilisation-error');
const { generateTotalFeesAccruedError } = require('./generate-total-fees-accrued-error');
const { generateMonthlyFeesPaidError } = require('./generate-monthly-fees-paid-error');
const { generateMonthlyFeesPaidCurrencyError } = require('./generate-monthly-fees-paid-currency-error')
const { generatePaymentCurrencyError } = require('./generate-payment-currency-error');
const { generatePaymentExchangeRateError } = require('./generate-payment-exchange-rate-error');

module.exports = {
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
  generateTotalFeesAccruedError,
  generateMonthlyFeesPaidError,
  generateMonthlyFeesPaidCurrencyError,
  generatePaymentCurrencyError,
  generatePaymentExchangeRateError,
};
