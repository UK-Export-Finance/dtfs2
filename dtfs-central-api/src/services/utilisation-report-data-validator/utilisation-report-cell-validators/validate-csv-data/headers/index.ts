import { UTILISATION_REPORT_HEADERS, UtilisationReportDataValidationError, UtilisationReportCsvRowData } from '@ukef/dtfs2-common';

const HEADER_IS_MISSING_BASE_ERROR_MESSAGE = 'header is missing or spelt incorrectly';

/**
 * Constructs "header is missing" error message
 * @param header - The header text
 * @returns The header is missing error message for the provided header
 */
export const getHeaderIsMissingErrorMessage = (header: string) => `${header} ${HEADER_IS_MISSING_BASE_ERROR_MESSAGE}`;

/**
 * validateHeaders
 * Validate utilisation report csv headers and get available headers
 * @param csvDataRow - A row of data
 * @returns Errors for any missing required headers and a list of the present headers
 */
export const validateHeaders = (
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
      missingHeaderErrors.push({ errorMessage: missingErrorMessage });
    } else {
      availableHeaders.push(header);
    }
  });

  return { missingHeaderErrors, availableHeaders };
};
