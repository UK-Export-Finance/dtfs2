const {
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
  generateMonthlyFeesPaidError,
  generateTotalFeesAccruedError,
  generatePaymentCurrencyError,
  generateExchangeRateError,
} = require('./utilisation-report-cell-validators');
const { UTILISATION_REPORT_HEADERS, LOWER_CASE_MONTH_NAMES } = require('../../../constants');

const validateCsvHeaders = (csvDataRow) => {
  const headers = Object.keys(csvDataRow);
  const requiredHeaders = [
    { header: UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID, missingErrorMessage: 'UKEF facility ID header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.BASE_CURRENCY, missingErrorMessage: 'Base currency header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION, missingErrorMessage: 'Facility utilisation header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED, missingErrorMessage: 'Total fees accrued for the month header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.MONTHLY_FEES_PAID, missingErrorMessage: 'Monthly fees paid to UKEF header is missing or spelt incorrectly' },
  ];
  const missingHeaderErrors = [];
  const availableHeaders = [];

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

const validateCsvCellData = (csvData, availableHeaders) => {
  const cellValidations = [
    { header: UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID, errorGenerator: generateUkefFacilityIdError },
    { header: UTILISATION_REPORT_HEADERS.BASE_CURRENCY, errorGenerator: generateBaseCurrencyError },
    { header: UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION, errorGenerator: generateFacilityUtilisationError },
    { header: UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED, errorGenerator: generateTotalFeesAccruedError },
    { header: UTILISATION_REPORT_HEADERS.MONTHLY_FEES_PAID, errorGenerator: generateMonthlyFeesPaidError },
  ];
  return csvData.flatMap((value) => {
    const csvDataErrors = [];

    cellValidations.forEach(({ header, errorGenerator }) => {
      if (availableHeaders.includes(header)) {
        const error = errorGenerator(value[header], value.exporter?.value);
        if (error) {
          csvDataErrors.push(error);
        }
      }
    });

    const paymentCurrencyValidationError = generatePaymentCurrencyError(value[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY], value.exporter?.value);
    if (paymentCurrencyValidationError) {
      csvDataErrors.push(paymentCurrencyValidationError);
    }

    const exchangeRateValidationError = generateExchangeRateError(value);
    if (exchangeRateValidationError) {
      csvDataErrors.push(exchangeRateValidationError);
    }

    return csvDataErrors;
  });
};

const validateCsvData = (csvData) => {
  const { missingHeaderErrors, availableHeaders } = validateCsvHeaders(csvData[0]);

  const dataValidationErrors = validateCsvCellData(csvData, availableHeaders);

  const validationErrors = missingHeaderErrors.concat(dataValidationErrors);

  return validationErrors;
};

/**
 * Checks the filename parameter to see if it contains a month anywhere
 * in the filename and, if it does, returns an object containing both
 * variations of the month name. If it doesn't find any months, it will
 * return undefined
 * @param {string} filename - The filename
 * @returns {{ longName: string, shortName: string } | undefined}
 */
const getMonthInFilename = (filename) => {
  const lowerCaseFilename = filename.toLowerCase();
  const monthNames = Object.values(LOWER_CASE_MONTH_NAMES).find(
    (month) => lowerCaseFilename.includes(month.longName) || lowerCaseFilename.includes(month.shortName),
  );
  return monthNames;
};

/**
 * Given a filename and a report period, this function checks whether
 * or not the filename contains a month and, if it does, whether or
 * not the month matches the report period passed in. If it does match,
 * it returns an empty object. Otherwise, it returns an object containing
 * a filename error message related to the specific case reached
 * @param {string} filename - The filename, using either '_' or '-' as a separator
 * @param {string} dueReportPeriod - The current due report period with format 'MMMM yyyy'
 * @returns {{ filenameError: string | undefined }}
 */
const validateFilenameContainsReportPeriod = (filename, dueReportPeriod) => {
  const exampleFilenameReportPeriod = dueReportPeriod.replace(' ', '_');

  const monthInFilename = getMonthInFilename(filename);
  if (!monthInFilename) {
    const filenameError = `The selected file must contain the reporting period as part of its name, for example '${exampleFilenameReportPeriod}'`;
    return { filenameError };
  }

  const currentReportPeriodYear = dueReportPeriod.split(' ').at(-1);
  const longFilenameReportPeriod = `${monthInFilename.longName}_${currentReportPeriodYear}`;
  const shortFilenameReportPeriod = `${monthInFilename.shortName}_${currentReportPeriodYear}`;
  const lowerCaseFilenameWithUnderscores = filename.toLowerCase().replace('-', '_');
  if (lowerCaseFilenameWithUnderscores.includes(longFilenameReportPeriod)) {
    return {};
  }
  if (lowerCaseFilenameWithUnderscores.includes(shortFilenameReportPeriod)) {
    return {};
  }

  const filenameError = `The selected file must be the ${dueReportPeriod} report`;
  return { filenameError };
};

module.exports = {
  validateCsvData,
  validateCsvHeaders,
  validateCsvCellData,
  getMonthInFilename,
  validateFilenameContainsReportPeriod,
};
