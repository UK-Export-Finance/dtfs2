const { HEADERS } = require('../../../../constants');
const { EXCHANGE_RATE_REGEX } = require('../../../../constants/regex');

const generateExchangeRateError = (csvDataRow, rowNumber) => {
  if (!csvDataRow[HEADERS.PAYMENT_CURRENCY]?.value || csvDataRow[HEADERS.PAYMENT_CURRENCY]?.value === csvDataRow[HEADERS.BASE_CURRENCY]?.value) {
    return null;
  }
  if (!csvDataRow[HEADERS.EXCHANGE_RATE]?.value) {
    return {
      errorMessage: 'Exchange rate must have an entry',
      column: csvDataRow[HEADERS.EXCHANGE_RATE]?.column,
      row: csvDataRow[HEADERS.EXCHANGE_RATE]?.row || rowNumber,
      value: csvDataRow[HEADERS.EXCHANGE_RATE]?.value,
      exporter: csvDataRow[HEADERS.EXPORTER]?.value,
    };
  }
  if (!EXCHANGE_RATE_REGEX.test(csvDataRow[HEADERS.EXCHANGE_RATE]?.value)) {
    return {
      errorMessage: 'Exchange rate must be a number',
      column: csvDataRow[HEADERS.EXCHANGE_RATE]?.column,
      row: csvDataRow[HEADERS.EXCHANGE_RATE]?.row || rowNumber,
      value: csvDataRow[HEADERS.EXCHANGE_RATE]?.value,
      exporter: csvDataRow[HEADERS.EXPORTER]?.value,
    };
  }
  if (csvDataRow[HEADERS.EXCHANGE_RATE]?.value.length > 15) {
    return {
      errorMessage: 'Exchange rate must be 15 characters or less',
      column: csvDataRow[HEADERS.EXCHANGE_RATE]?.column,
      row: csvDataRow[HEADERS.EXCHANGE_RATE]?.row || rowNumber,
      value: csvDataRow[HEADERS.EXCHANGE_RATE]?.value,
      exporter: csvDataRow[HEADERS.EXPORTER]?.value,
    };
  }
  return null;
};

module.exports = { generateExchangeRateError };
