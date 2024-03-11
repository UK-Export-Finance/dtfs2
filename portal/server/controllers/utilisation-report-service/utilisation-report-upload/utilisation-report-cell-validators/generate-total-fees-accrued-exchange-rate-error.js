const { UTILISATION_REPORT_HEADERS } = require('../../../../constants');
const { FILE_UPLOAD } = require('../../../../constants/file-upload');
const { EXCHANGE_RATE_REGEX } = require('../../../../constants/regex');

/**
 * Validates an object representing a row of csv data to check if the total fees accrued exchange rate is valid.
 * @param {unknown} csvDataRow - object representing a row of csv data.
 * @returns {object | null} - object comprising of error message and error location or null if valid.
 */
const generateTotalFeesAccruedExchangeRateError = (csvDataRow) => {
  if (
    !csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value 
    || (csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value === csvDataRow[UTILISATION_REPORT_HEADERS.BASE_CURRENCY]?.value
      && !csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value)
      ) {
    return null;
  }
  if (!csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value) {
    return {
      errorMessage: 'Accrual exchange rate must have an entry when an accrual currency is supplied',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  if (!EXCHANGE_RATE_REGEX.test(csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value)) {
    return {
      errorMessage: 'Accrual exchange rate must be a number',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  if (csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value.length > FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT) {
    return {
      errorMessage: `Accrual exchange rate must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  return null;
};

module.exports = { generateTotalFeesAccruedExchangeRateError };
