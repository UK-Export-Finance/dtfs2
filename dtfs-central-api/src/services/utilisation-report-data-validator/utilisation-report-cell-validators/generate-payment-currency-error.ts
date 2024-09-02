import validator from 'validator';
import { UTILISATION_REPORT_HEADERS } from '@ukef/dtfs2-common';
import { UtilisationReportRowValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Generate and return error for payment currency entry in the csv row if value is invalid
 * @param csvDataRow - The row data for which to validate the payment currency
 * @returns The error if the payment currency entry is invalid, null if the payment currency entry is valid
 */
export const generatePaymentCurrencyError: UtilisationReportRowValidationErrorGenerator = (csvDataRow) => {
  const paymentCurrencyValue = csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value;
  if (!csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value && !paymentCurrencyValue) {
    return null;
  }

  if (!paymentCurrencyValue) {
    return {
      errorMessage: 'Payment currency must have an entry when a payment exchange rate is supplied',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }

  if (!validator.isISO4217(paymentCurrencyValue)) {
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
