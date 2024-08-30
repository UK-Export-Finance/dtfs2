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
} from './utilisation-report-cell-validators';

const HEADER_IS_MISSING_BASE_ERROR_MESSAGE = 'header is missing or spelt incorrectly';

export const getHeaderIsMissingErrorMessage = (header: string) => `${header} ${HEADER_IS_MISSING_BASE_ERROR_MESSAGE}`;

/**
 * Validate utilisation report csv headers
 * @param csvDataRow - A row of data
 * @returns Errors for any missing required headers and a list of the present headers
 */
export const validateUtilisationReportCsvHeaders = (
  csvDataRow: UtilisationReportCsvRowData,
): { missingHeaderErrors: UtilisationReportDataValidationError[]; availableHeaders: string[] } => {
  const headers = Object.keys(csvDataRow);
  const requiredHeaders = [
    {
      header: UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID,
      missingErrorMessage: getHeaderIsMissingErrorMessage('UKEF facility ID'),
    },
    {
      header: UTILISATION_REPORT_HEADERS.BASE_CURRENCY,
      missingErrorMessage: getHeaderIsMissingErrorMessage('Base currency'),
    },
    {
      header: UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION,
      missingErrorMessage: getHeaderIsMissingErrorMessage('Facility utilisation'),
    },
    {
      header: UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED,
      missingErrorMessage: getHeaderIsMissingErrorMessage('Total fees accrued for the period'),
    },
    {
      header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD,
      missingErrorMessage: getHeaderIsMissingErrorMessage('Fees paid to UKEF for the period'),
    },
    {
      header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY,
      missingErrorMessage: getHeaderIsMissingErrorMessage('Fees paid to UKEF currency'),
    },
  ];
  const missingHeaderErrors: UtilisationReportDataValidationError[] = [];
  const availableHeaders: string[] = [];

  requiredHeaders.forEach(({ header, missingErrorMessage }) => {
    if (!headers.includes(header)) {
      missingHeaderErrors.push({
        errorMessage: missingErrorMessage,
        column: null,
        row: null,
        value: null,
        exporter: null,
      });
    } else {
      availableHeaders.push(header);
    }
  });

  return { missingHeaderErrors, availableHeaders };
};

/**
 * Validate the utilisation report data from the body of the csv
 * @param csvData - The data from the uploaded csv file
 * @param availableHeaders - The available headers
 * @returns An array of errors if there are any
 */
export const validateUtilisationReportCsvCellData = (
  csvData: Record<string, UtilisationReportCsvCellData>[],
  availableHeaders: string[],
): UtilisationReportDataValidationError[] => {
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

  return csvData.flatMap((csvRow) => {
    const csvDataErrors: UtilisationReportDataValidationError[] = [];

    cellValidations.forEach(({ header, errorGenerator }) => {
      if (availableHeaders.includes(header)) {
        const error = errorGenerator(csvRow[header], csvRow.exporter?.value);
        if (error) {
          csvDataErrors.push(error);
        }
      }
    });

    rowValidations.forEach((errorGenerator) => {
      const error = errorGenerator(csvRow);
      if (error) {
        csvDataErrors.push(error);
      }
    });

    return csvDataErrors;
  });
};

/**
 * Validate the utilisation report csv data
 * @param csvData - The data from the utilisation report csv
 * @returns An array of errors pertaining to the report if there are any
 */
export const validateUtilisationReportCsvData = (csvData: UtilisationReportCsvRowData[]): UtilisationReportDataValidationError[] => {
  const { missingHeaderErrors, availableHeaders } = validateUtilisationReportCsvHeaders(csvData[0]);

  const dataValidationErrors = validateUtilisationReportCsvCellData(csvData, availableHeaders);

  const validationErrors = missingHeaderErrors.concat(dataValidationErrors);

  return validationErrors;
};
