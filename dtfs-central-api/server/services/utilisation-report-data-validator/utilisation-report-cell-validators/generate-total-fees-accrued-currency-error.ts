import { CURRENCY, UTILISATION_REPORT_HEADERS } from '@ukef/dtfs2-common';
import { UtilisationReportRowValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Generate and return an error for total fees accrued currency entry in csv row if value is invalid
 * @param csvDataRow - The row data for which to validate the total fees accrued currency
 * @returns The error if the total fees accrued currency entry is invalid, null if the total fees accrued currency entry is valid
 */
export const generateTotalFeesAccruedCurrencyError: UtilisationReportRowValidationErrorGenerator = (csvDataRow) => {
  const totalFeesAccruedCurrencyValue = csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value;
  const totalFeesAccruedExchangeRateValue = csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value;

  if (!totalFeesAccruedCurrencyValue && !totalFeesAccruedExchangeRateValue) {
    return null;
  }

  if (!totalFeesAccruedCurrencyValue) {
    return {
      errorMessage: 'Accrual currency must have an entry when an accrual exchange rate is supplied',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }

  if (!(totalFeesAccruedCurrencyValue in CURRENCY)) {
    return {
      errorMessage: 'The report can only include the following currencies: GBP, EUR, USD, JPY',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }

  return null;
};
