const { UTILISATION_REPORT_HEADERS } = require('@ukef/dtfs2-common');
const { FILE_UPLOAD } = require('../../../../constants/file-upload');
const { EXCHANGE_RATE_REGEX } = require('../../../../constants/regex');

const generatePaymentExchangeRateError = (csvDataRow) => {
  if (
    !csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value &&
    (!csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value ||
      csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value ===
        csvDataRow[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY]?.value)
  ) {
    return null;
  }
  if (!csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value) {
    return {
      errorMessage: 'Payment exchange rate must have an entry when a payment currency is supplied',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  if (
    csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value ===
      csvDataRow[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY]?.value &&
    parseFloat(csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value) !== 1
  ) {
    return {
      errorMessage:
        'Payment exchange rate must be 1 or blank when payment currency and fees paid to UKEF currency are the same',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  if (!EXCHANGE_RATE_REGEX.test(csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value)) {
    return {
      errorMessage: 'Payment exchange rate must be a number',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  if (
    csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value.length > FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT
  ) {
    return {
      errorMessage: `Payment exchange rate must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  return null;
};

module.exports = { generatePaymentExchangeRateError };
