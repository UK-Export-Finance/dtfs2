const validator = require('validator');
const { UTILISATION_REPORT_HEADERS } = require('@ukef/dtfs2-common');

const generatePaymentCurrencyError = (csvDataRow) => {
  if (!csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value && !csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value) {
    return null;
  }
  if (!csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value) {
    return {
      errorMessage: 'Payment currency must have an entry when a payment exchange rate is supplied',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  if (!validator.isISO4217(csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value)) {
    return {
      errorMessage: 'Payment currency must be in the ISO 4217 currency code format',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  return null;
};

module.exports = { generatePaymentCurrencyError };
