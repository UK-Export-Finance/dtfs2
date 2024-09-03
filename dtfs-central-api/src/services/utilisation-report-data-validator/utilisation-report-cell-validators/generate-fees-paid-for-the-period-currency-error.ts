import validator from 'validator';
import { UtilisationReportCellValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Generate and return an error for fees paid to ukef for the period currency cell if value is invalid
 * @param feesPaidForThePeriodCurrencyCellData - The cell data for the fees paid to ukef for the period currency
 * @param exporterName - The name of the exporter for that csv row
 * @returns The error if data is invalid, null if the data is valid
 */
export const generateFeesPaidForThePeriodCurrencyError: UtilisationReportCellValidationErrorGenerator = (
  feesPaidForThePeriodCurrencyCellData,
  exporterName,
) => {
  if (!feesPaidForThePeriodCurrencyCellData?.value) {
    return {
      errorMessage: 'Fees paid to UKEF currency must have an entry',
      column: feesPaidForThePeriodCurrencyCellData?.column,
      row: feesPaidForThePeriodCurrencyCellData?.row,
      value: feesPaidForThePeriodCurrencyCellData?.value,
      exporter: exporterName,
    };
  }

  if (!validator.isISO4217(feesPaidForThePeriodCurrencyCellData.value)) {
    return {
      errorMessage: 'Fees paid to UKEF currency must be in the ISO 4217 currency code format',
      column: feesPaidForThePeriodCurrencyCellData?.column,
      row: feesPaidForThePeriodCurrencyCellData?.row,
      value: feesPaidForThePeriodCurrencyCellData?.value,
      exporter: exporterName,
    };
  }

  return null;
};
