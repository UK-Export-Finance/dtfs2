import { CURRENCY_NUMBER_REGEX } from '@ukef/dtfs2-common';
import { CSV } from '../../../constants/csv';
import { UtilisationReportCellValidationErrorGenerator } from './types/validation-error-generator';

/**
 * Generate and return an error for the total fees accrued cell if value is invalid
 * @param totalFeesAccruedCellData - The cell data for the total fees accrued cell
 * @param exporterName - The name of the exporter for that csv row
 * @returns The error if data is invalid, null if the data is valid
 */
export const generateTotalFeesAccruedError: UtilisationReportCellValidationErrorGenerator = (totalFeesAccruedCellData, exporterName) => {
  if (!totalFeesAccruedCellData) {
    return {
      errorMessage: 'Total fees accrued for the period must have an entry',
      exporter: exporterName,
    };
  }

  const { value, column, row } = totalFeesAccruedCellData;

  const generateError = (errorMessage: string) => ({ errorMessage, column, row, value, exporter: exporterName });

  if (!value) {
    return generateError('Total fees accrued for the period must have an entry');
  }

  if (!CURRENCY_NUMBER_REGEX.test(value)) {
    return generateError('Total fees accrued for the period must be a number with a maximum of two decimal places');
  }

  if (value.length > CSV.MAX_CELL_CHARACTER_COUNT) {
    return generateError(`Total fees accrued for the period must be ${CSV.MAX_CELL_CHARACTER_COUNT} characters or less`);
  }

  return null;
};
