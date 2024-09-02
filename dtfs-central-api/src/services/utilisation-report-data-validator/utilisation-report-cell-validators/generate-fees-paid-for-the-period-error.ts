import { UtilisationReportCellValidationErrorGenerator } from './types/validation-error-generator';
import { CURRENCY_NUMBER_REGEX } from '../../../constants/regex';
import { CSV } from '../../../constants';

/**
 * Generate and return error for fees paid to ukef for the period cell if value is invalid
 * @param feesPaidForThePeriodCellData - The cell data for the fees paid to ukef for the period
 * @param exporterName - The name of the exporter for that csv row
 * @returns The error if data is invalid, null if the data is valid
 */
export const generateFeesPaidForThePeriodError: UtilisationReportCellValidationErrorGenerator = (feesPaidForThePeriodCellData, exporterName) => {
  if (!feesPaidForThePeriodCellData?.value) {
    return {
      errorMessage: 'Fees paid to UKEF for the period must have an entry',
      column: feesPaidForThePeriodCellData?.column,
      row: feesPaidForThePeriodCellData?.row,
      value: feesPaidForThePeriodCellData?.value,
      exporter: exporterName,
    };
  }

  if (!CURRENCY_NUMBER_REGEX.test(feesPaidForThePeriodCellData.value)) {
    return {
      errorMessage: 'Fees paid to UKEF for the period must be a number with a maximum of two decimal places',
      column: feesPaidForThePeriodCellData?.column,
      row: feesPaidForThePeriodCellData?.row,
      value: feesPaidForThePeriodCellData?.value,
      exporter: exporterName,
    };
  }

  if (feesPaidForThePeriodCellData.value.length > CSV.MAX_CELL_CHARACTER_COUNT) {
    return {
      errorMessage: `Fees paid to UKEF for the period must be ${CSV.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: feesPaidForThePeriodCellData?.column,
      row: feesPaidForThePeriodCellData?.row,
      value: feesPaidForThePeriodCellData?.value,
      exporter: exporterName,
    };
  }

  return null;
};
