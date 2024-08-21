import {
  UTILISATION_REPORT_HEADERS,
  UtilisationReportDataValidationError,
  UtilisationReportRawCsvCellDataWithLocation,
  UtilisationReportRawCsvRowDataWithLocations,
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

export const validateCsvHeaders = (
  csvDataRow: UtilisationReportRawCsvRowDataWithLocations,
): { missingHeaderErrors: UtilisationReportDataValidationError[]; availableHeaders: string[] } => {
  const headers = Object.keys(csvDataRow);
  const requiredHeaders = [
    {
      header: UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID,
      missingErrorMessage: 'UKEF facility ID header is missing or spelt incorrectly',
    },
    {
      header: UTILISATION_REPORT_HEADERS.BASE_CURRENCY,
      missingErrorMessage: 'Base currency header is missing or spelt incorrectly',
    },
    {
      header: UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION,
      missingErrorMessage: 'Facility utilisation header is missing or spelt incorrectly',
    },
    {
      header: UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED,
      missingErrorMessage: 'Total fees accrued for the period header is missing or spelt incorrectly',
    },
    {
      header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD,
      missingErrorMessage: 'Fees paid to UKEF for the period header is missing or spelt incorrectly',
    },
    {
      header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY,
      missingErrorMessage: 'Fees paid to UKEF currency header is missing or spelt incorrectly',
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

export const validateCsvCellData = (
  csvData: Record<string, UtilisationReportRawCsvCellDataWithLocation>[],
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

  const optionalValueCellValidations = [
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

    optionalValueCellValidations.forEach((errorGenerator) => {
      const error = errorGenerator(csvRow);
      if (error) {
        csvDataErrors.push(error);
      }
    });

    return csvDataErrors;
  });
};

export const validateCsvData = (csvData: UtilisationReportRawCsvRowDataWithLocations[]): UtilisationReportDataValidationError[] => {
  const { missingHeaderErrors, availableHeaders } = validateCsvHeaders(csvData[0]);

  const dataValidationErrors = validateCsvCellData(csvData, availableHeaders);

  const validationErrors = missingHeaderErrors.concat(dataValidationErrors);

  return validationErrors;
};
