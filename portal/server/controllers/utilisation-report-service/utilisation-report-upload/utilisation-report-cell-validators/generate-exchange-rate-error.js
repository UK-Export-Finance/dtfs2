const { HEADERS } = require('../../../../constants');
const { FILE_UPLOAD } = require('../../../../constants/file-upload');
const { EXCHANGE_RATE_REGEX } = require('../../../../constants/regex');

const generateExchangeRateError = (csvDataRow) => {
  if (!csvDataRow[HEADERS.PAYMENT_CURRENCY]?.value || csvDataRow[HEADERS.PAYMENT_CURRENCY]?.value === csvDataRow[HEADERS.BASE_CURRENCY]?.value) {
    return null;
  }
  if (!csvDataRow[HEADERS.EXCHANGE_RATE]?.value) {
    return {
      errorMessage: 'Exchange rate must have an entry',
      column: csvDataRow[HEADERS.EXCHANGE_RATE]?.column,
      row: csvDataRow[HEADERS.EXCHANGE_RATE]?.row,
      value: csvDataRow[HEADERS.EXCHANGE_RATE]?.value,
      exporter: csvDataRow[HEADERS.EXPORTER]?.value,
    };
  }
  if (!EXCHANGE_RATE_REGEX.test(csvDataRow[HEADERS.EXCHANGE_RATE]?.value)) {
    return {
      errorMessage: 'Exchange rate must be a number',
      column: csvDataRow[HEADERS.EXCHANGE_RATE]?.column,
      row: csvDataRow[HEADERS.EXCHANGE_RATE]?.row,
      value: csvDataRow[HEADERS.EXCHANGE_RATE]?.value,
      exporter: csvDataRow[HEADERS.EXPORTER]?.value,
    };
  }
  if (csvDataRow[HEADERS.EXCHANGE_RATE]?.value.length > FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT) {
    return {
      errorMessage: `Exchange rate must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: csvDataRow[HEADERS.EXCHANGE_RATE]?.column,
      row: csvDataRow[HEADERS.EXCHANGE_RATE]?.row,
      value: csvDataRow[HEADERS.EXCHANGE_RATE]?.value,
      exporter: csvDataRow[HEADERS.EXPORTER]?.value,
    };
  }
  return null;
};

module.exports = { generateExchangeRateError };
