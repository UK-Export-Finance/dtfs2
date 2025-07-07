import { CURRENCY } from '@ukef/dtfs2-common';
import { UtilisationReportCellValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Generate and return an error for base currency cell if value is invalid
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

  if (!(currencyCellData.value in CURRENCY)) {
    return {
      errorMessage: 'The report can only include the following currencies: GBP, EUR, USD, JPY',
      column: currencyCellData?.column,
      row: currencyCellData?.row,
      value: currencyCellData?.value,
      exporter: exporterName,
    };
  }

  return null;
};
