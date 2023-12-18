const validator = require('validator');
const { UTILISATION_REPORT_HEADERS } = require('../../../../constants');

const generateTotalFeesAccruedCurrencyError = (csvDataRow) => {
  if (
    !csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value &&
    !csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value
  ) {
    return null;
  }
  if (!csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value) {
    return {
      errorMessage: 'Accrual currency must have an entry when an accrual exchange rate is supplied',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  if (!validator.isISO4217(csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value)) {
    return {
      errorMessage: 'Accrual currency must be in the ISO 4217 currency code format',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  return null;
};

module.exports = { generateTotalFeesAccruedCurrencyError };
