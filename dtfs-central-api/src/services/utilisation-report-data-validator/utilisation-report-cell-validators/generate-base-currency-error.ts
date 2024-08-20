import validator from 'validator';
import { UtilisationReportCellValidationErrorGenerator } from './types/validation-error-generator';

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
