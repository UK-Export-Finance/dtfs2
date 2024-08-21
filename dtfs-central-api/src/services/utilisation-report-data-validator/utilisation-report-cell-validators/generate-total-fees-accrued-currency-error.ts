import validator from 'validator';
import { UTILISATION_REPORT_HEADERS } from '@ukef/dtfs2-common';
import { UtilisationReportRowValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Generate and return error for total fees accrued currency entry in csv row if value is invalid
 * @param csvDataRow - The row data for which to validate the total fees accrued currency
 * @returns The error if the total fees accrued currency entry is invalid, null if the total fees accrued currency entry is valid
 */
export const generateTotalFeesAccruedCurrencyError: UtilisationReportRowValidationErrorGenerator = (csvDataRow) => {
  if (
    !csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value &&
    !csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE]?.value
  ) {
    return null;
  }
  const totalFeesAccruedCurrencyValue = csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value;
  if (!totalFeesAccruedCurrencyValue) {
    return {
      errorMessage: 'Accrual currency must have an entry when an accrual exchange rate is supplied',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  if (!validator.isISO4217(totalFeesAccruedCurrencyValue)) {
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
