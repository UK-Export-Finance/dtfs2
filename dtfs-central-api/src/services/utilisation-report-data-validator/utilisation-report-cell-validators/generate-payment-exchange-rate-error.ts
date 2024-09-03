import { UTILISATION_REPORT_HEADERS } from '@ukef/dtfs2-common';
import { CSV } from '../../../constants/csv';
import { EXCHANGE_RATE_REGEX } from '../../../constants/regex';
import { UtilisationReportRowValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Generate and return an error for payment exchange rate entry in the csv row if value is invalid
 * @param csvDataRow - The row data for which to validate the payment exchange rate
 * @returns The error if the payment exchange rate entry is invalid, null if the payment exchange rate entry is valid
 */
export const generatePaymentExchangeRateError: UtilisationReportRowValidationErrorGenerator = (csvDataRow) => {
  const paymentExchangeRateValue = csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value;
  const paymentCurrencyValue = csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value;
  const feesPaidInPeriodCurrencyValue = csvDataRow[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY]?.value;
  const paymentCurrencyMatchesFeesPaidInPeriodCurrency = paymentCurrencyValue === feesPaidInPeriodCurrencyValue;

  if (!paymentExchangeRateValue && (!paymentCurrencyValue || paymentCurrencyMatchesFeesPaidInPeriodCurrency)) {
    return null;
  }

  if (!paymentExchangeRateValue) {
    return {
      errorMessage: 'Payment exchange rate must have an entry when a payment currency is supplied',
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }

  if (paymentCurrencyMatchesFeesPaidInPeriodCurrency && parseFloat(paymentExchangeRateValue) !== 1) {
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

  if (paymentExchangeRateValue.length > CSV.MAX_CELL_CHARACTER_COUNT) {
    return {
      errorMessage: `Payment exchange rate must be ${CSV.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.column,
      row: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.row,
      value: csvDataRow[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE]?.value,
      exporter: csvDataRow[UTILISATION_REPORT_HEADERS.EXPORTER]?.value,
    };
  }

  return null;
};
