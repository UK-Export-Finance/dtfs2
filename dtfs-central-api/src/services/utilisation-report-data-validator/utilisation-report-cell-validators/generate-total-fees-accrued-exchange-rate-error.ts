import { UTILISATION_REPORT_HEADERS } from '@ukef/dtfs2-common';
import { CSV } from '../../../constants/csv';
import { EXCHANGE_RATE_REGEX } from '../../../constants/regex';
import { UtilisationReportRowValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Validates an object representing a row of csv data to check if the total fees accrued exchange rate is valid.
 * @param csvDataRow - object representing a row of csv data.
 * @returns - object comprising of error message and error location or null if valid.
 */
export const generateTotalFeesAccruedExchangeRateError: UtilisationReportRowValidationErrorGenerator = (csvDataRow) => {
  const totalFeesAccruedExchangeRateValue = csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value;
  const totalFeesAccruedCurrencyValue = csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value;
  const baseCurrencyValue = csvDataRow[UTILISATION_REPORT_HEADERS.BASE_CURRENCY]?.value;
  const totalFeesAccruedCurrencyMatchesBaseCurrency = totalFeesAccruedCurrencyValue === baseCurrencyValue;

  if (!totalFeesAccruedExchangeRateValue && (!totalFeesAccruedCurrencyValue || totalFeesAccruedCurrencyMatchesBaseCurrency)) {
    return null;
  }

  if (!totalFeesAccruedExchangeRateValue) {
    return {
      errorMessage: 'Accrual exchange rate must have an entry when an accrual currency is supplied',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }

  if (totalFeesAccruedCurrencyMatchesBaseCurrency && parseFloat(totalFeesAccruedExchangeRateValue) !== 1) {
    return {
      errorMessage: 'Accrual exchange rate must be 1 or blank when accrual currency and base currency are the same',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }

  if (!EXCHANGE_RATE_REGEX.test(totalFeesAccruedExchangeRateValue)) {
    return {
      errorMessage: 'Accrual exchange rate must be a number',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }

  if (totalFeesAccruedExchangeRateValue.length > CSV.MAX_CELL_CHARACTER_COUNT) {
    return {
      errorMessage: `Accrual exchange rate must be ${CSV.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }

  return null;
};
