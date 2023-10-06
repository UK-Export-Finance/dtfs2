const validator = require('validator');

const generatePaymentCurrencyError = (paymentCurrencyObject, exporterName) => {
  if (!paymentCurrencyObject?.value) {
    return null;
  }
  if (!validator.isISO4217(paymentCurrencyObject?.value)) {
    return {
      errorMessage: 'Payment currency must be in the ISO 4217 currency code format',
      column: paymentCurrencyObject?.column,
      row: paymentCurrencyObject?.row,
      value: paymentCurrencyObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};

module.exports = { generatePaymentCurrencyError };
