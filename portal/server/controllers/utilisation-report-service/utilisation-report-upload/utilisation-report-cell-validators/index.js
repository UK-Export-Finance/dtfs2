const { generateUkefFacilityIdError } = require('./generate-ukef-facility-id-error');
const { generateBaseCurrencyError } = require('./generate-base-currency-error');
const { generateFacilityUtilisationError } = require('./generate-facility-utilisation-error');
const { generateTotalFeesAccruedError } = require('./generate-total-fees-accrued-error');
const { generateMonthlyFeesPaidError } = require('./generate-monthly-fees-paid-error');
const { generatePaymentCurrencyError } = require('./generate-payment-currency-error');
const { generateExchangeRateError } = require('./generate-exchange-rate-error');

module.exports = {
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
  generateTotalFeesAccruedError,
  generateMonthlyFeesPaidError,
  generatePaymentCurrencyError,
  generateExchangeRateError,
};
