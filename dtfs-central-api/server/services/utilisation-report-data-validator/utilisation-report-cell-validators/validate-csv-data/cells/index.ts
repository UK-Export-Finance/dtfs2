import {
  UTILISATION_REPORT_HEADERS,
  UtilisationReportDataValidationError,
  UtilisationReportCsvCellData,
  UtilisationReportCsvRowData,
} from '@ukef/dtfs2-common';
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
import { UKEF_FACILITY_ID_REGEX } from '../../../../../constants/regex';
import { TfmFacilitiesRepo } from '../../../../../repositories/tfm-facilities-repo';

/**
 * validateCells
 * Validate the utilisation report cell data from the body of the csv
 * @param csvData - The data from the uploaded csv file
 * @param availableHeaders - The available headers
 * @returns An array of errors if there are any
 */
export const validateCells = async (csvData: UtilisationReportCsvRowData[], availableHeaders: string[]): Promise<UtilisationReportDataValidationError[]> => {
  // Look up all facility IDs in a single query rather than one query per row
  const ukefFacilityIds = availableHeaders.includes(UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID)
    ? csvData
        .map((csvRow) => csvRow[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]?.value)
        .filter((value): value is string => !!value && UKEF_FACILITY_ID_REGEX.test(value))
    : [];
  const existingUkefGefFacilityIds = await TfmFacilitiesRepo.findExistingUkefGefFacilityIds([...new Set(ukefFacilityIds)]);

  const cellValidations = [
    {
      header: UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID,
      errorGenerator: (cellData: UtilisationReportCsvCellData | undefined, exporterName?: string | null) =>
        generateUkefFacilityIdError(cellData, exporterName, existingUkefGefFacilityIds),
    },
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
