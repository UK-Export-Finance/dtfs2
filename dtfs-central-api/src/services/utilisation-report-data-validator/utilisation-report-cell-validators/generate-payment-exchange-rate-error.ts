import { UTILISATION_REPORT_HEADERS } from '@ukef/dtfs2-common';
import { FILE_UPLOAD } from '../../../constants/file-upload';
import { EXCHANGE_RATE_REGEX } from '../../../constants/regex';
import { UtilisationReportRowValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Generate and return error for payment exchange rate entry in the csv row if value is invalid
 * @param csvDataRow - The row data for which to validate the payment exchange rate
 * @returns The error if the payment exchange rate entry is invalid, null if the payment exchange rate entry is valid
 */
export const generatePaymentExchangeRateError: UtilisationReportRowValidationErrorGenerator = (csvDataRow) => {
  if (
    !csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value &&
    (!csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value ||
      csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value === csvDataRow[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY]?.value)
  ) {
    return null;
  }

  const paymentExchangeRateValue = csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value;
  if (!paymentExchangeRateValue) {
    return {
      errorMessage: 'Payment exchange rate must have an entry when a payment currency is supplied',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  if (
    csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value === csvDataRow[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY]?.value &&
    parseFloat(paymentExchangeRateValue) !== 1
  ) {
    return {
      errorMessage: 'Payment exchange rate must be 1 or blank when payment currency and fees paid to UKEF currency are the same',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  if (!EXCHANGE_RATE_REGEX.test(paymentExchangeRateValue)) {
    return {
      errorMessage: 'Payment exchange rate must be a number',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }
  if (paymentExchangeRateValue.length > FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT) {
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
