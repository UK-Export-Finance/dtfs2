import validator from 'validator';
import { UtilisationReportCellValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Generate and return error for base currency cell if value is invalid
 * @param currencyCellData - The cell data for the base currency cell
 * @param exporterName - The name of the exporter for that csv row
 * @returns The error if data is invalid, null if the data is valid
 */
export const generateBaseCurrencyError: UtilisationReportCellValidationErrorGenerator = (currencyCellData, exporterName) => {
  if (!currencyCellData?.value) {
    return {
      errorMessage: 'Base currency must have an entry',
      column: currencyCellData?.column,
      row: currencyCellData?.row,
      value: currencyCellData?.value,
      exporter: exporterName,
    };
  }
  if (!validator.isISO4217(currencyCellData?.value)) {
    return {
      errorMessage: 'Base currency must be in the ISO 4217 currency code format',
      column: currencyCellData?.column,
      row: currencyCellData?.row,
      value: currencyCellData?.value,
      exporter: exporterName,
    };
  }
  return null;
};
