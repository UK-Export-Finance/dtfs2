import { UTILISATION_REPORT_HEADERS, UtilisationReportDataValidationError, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';
import {
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
  generateTotalFeesAccruedError,
  generateTotalFeesAccruedCurrencyError,
  generateTotalFeesAccruedExchangeRateError,
  generatePaymentCurrencyError,
  generatePaymentExchangeRateError,
  generateFeesPaidForThePeriodError,
  generateFeesPaidForThePeriodCurrencyError,
} from '../..';

/**
 * validateCells
 * Validate the utilisation report cell data from the body of the csv
 * @param csvData - The data from the uploaded csv file
 * @param availableHeaders - The available headers
 * @returns An array of errors if there are any
 */
export const validateCells = async (csvData: UtilisationReportCsvRowData[], availableHeaders: string[]): Promise<UtilisationReportDataValidationError[]> => {
  const cellValidations = [
    { header: UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID, errorGenerator: generateUkefFacilityIdError },
    { header: UTILISATION_REPORT_HEADERS.BASE_CURRENCY, errorGenerator: generateBaseCurrencyError },
    { header: UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION, errorGenerator: generateFacilityUtilisationError },
    { header: UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED, errorGenerator: generateTotalFeesAccruedError },
    { header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD, errorGenerator: generateFeesPaidForThePeriodError },
    {
      header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY,
      errorGenerator: generateFeesPaidForThePeriodCurrencyError,
    },
  ];

  const rowValidations = [
    generateTotalFeesAccruedCurrencyError,
    generateTotalFeesAccruedExchangeRateError,
    generatePaymentCurrencyError,
    generatePaymentExchangeRateError,
  ];

  /**
   * maps through the csv data
   * maps through cellValidations and generates errors for each validation
   * then maps through rowValidations and generates errors for each validation
   * resolves the promises and returns the errors
   */
  const errors = await Promise.all(
    csvData.map(async (csvRow) => {
      const cellErrorPromises = cellValidations.map(({ header, errorGenerator }) => {
        if (!availableHeaders.includes(header)) {
          return null;
        }

        return errorGenerator(csvRow[header], csvRow.exporter?.value);
      });

      const rowErrorPromises = rowValidations.map((errorGenerator) => errorGenerator(csvRow));

      return Promise.all([...cellErrorPromises, ...rowErrorPromises]);
    }),
  );

  // Filter out null errors so that we don't return any null elements in the response array
  const filteredErrors = errors.flat().filter((error): error is UtilisationReportDataValidationError => error !== null);

  return filteredErrors;
};
