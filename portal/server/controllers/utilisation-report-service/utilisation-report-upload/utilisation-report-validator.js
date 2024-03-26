const { isEqualMonthAndYear } = require('@ukef/dtfs2-common');
const {
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
  generateMonthlyFeesPaidError,
  generateTotalFeesAccruedError,
  generateTotalFeesAccruedCurrencyError,
  generateTotalFeesAccruedExchangeRateError,
  generateMonthlyFeesPaidCurrencyError,
  generatePaymentCurrencyError,
  generatePaymentExchangeRateError,
} = require('./utilisation-report-cell-validators');
const { UTILISATION_REPORT_HEADERS, MONTH_NAMES, FILE_UPLOAD } = require('../../../constants');

const validateCsvHeaders = (csvDataRow) => {
  const headers = Object.keys(csvDataRow);
  const requiredHeaders = [
    { header: UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID, missingErrorMessage: 'UKEF facility ID header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.BASE_CURRENCY, missingErrorMessage: 'Base currency header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION, missingErrorMessage: 'Facility utilisation header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED, missingErrorMessage: 'Total fees accrued for the period header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD, missingErrorMessage: 'Fees paid to UKEF for the period header is missing or spelt incorrectly' },
    {
      header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY,
      missingErrorMessage: 'Fees paid to UKEF currency header is missing or spelt incorrectly',
    },
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
    { header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD, errorGenerator: generateMonthlyFeesPaidError },
    { header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY, errorGenerator: generateMonthlyFeesPaidCurrencyError },
  ];

  const optionalValueCellValidations = [
    generateTotalFeesAccruedCurrencyError,
    generateTotalFeesAccruedExchangeRateError,
    generatePaymentCurrencyError,
    generatePaymentExchangeRateError,
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

    optionalValueCellValidations.forEach((errorGenerator) => {
      const error = errorGenerator(value);
      if (error) {
        csvDataErrors.push(error);
      }
    });

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
 * Gets the regex group for all the possible month representations we
 * are expecting for the supplied one indexed month
 * @param {import('@ukef/dtfs2-common').OneIndexedMonth} oneIndexedMonth - The one indexed month
 * @returns {string} A regex string for the given month and year combination
 * @throws {Error} If a month matching the supplied `longMonthName` cannot be found
 */
const getMonthRegexString = (oneIndexedMonth) => {
  const monthNames = Object.values(MONTH_NAMES).find(({ index }) => index === oneIndexedMonth);
  if (!monthNames) {
    throw new Error(`Failed to find month names for one indexed month '${oneIndexedMonth}'`);
  }
  return `(${monthNames.long}|${monthNames.short}|${monthNames.numeric})`;
};

/**
 * Gets the regex instance for the supplied groups using the
 * format which is expected for the filename
 * @param  {...string} groups - The month and year components
 * @returns {RegExp} The regex for the supplied months and years
 * @example
 * // Monthly, January 2024
 * const monthRegexString = `(${'January'}|${'Jan'}|${'01'})`;
 * const year = 2024;
 * const filenameReportPeriodRegex = getFilenameReportPeriodRegex(
 *   monthRegexString,
 *   year,
 * ); // equivalent to '/(January|Jan|01)[-_]2024/i'
 *
 * // Quarterly, November 2023 to February 2024
 * const startMonthRegexString = `(${'November'}|${'Nov'}|${'11'})`;
 * const startYear = 2023;
 * const endMonthRegexString = `(${'February'}|${'Feb'}|${'02'})`;
 * const endYear = 2024;
 * const filenameReportPeriodRegex = getFilenameReportPeriodRegex(
 *   startMonthRegexString,
 *   startYear,
 *   endMonthRegexString,
 *   endYear,
 * ); // equivalent to '/(November|Nov|11)[-_]2023[-_](February|Feb|02)[-_]2024/i'
 */
const getFilenameReportPeriodRegex = (...groups) => {
  const regexString = groups.join(FILE_UPLOAD.FILENAME_SEPARATOR_GROUP);
  return new RegExp(regexString, 'i');
};

/**
 * Gets an example filename for the specified report period
 * @param {import('@ukef/dtfs2-common').ReportPeriod} dueReportPeriod - The due report period
 * @returns {string} An example filename
 */
const getExampleFilenameReportPeriod = (dueReportPeriod) => {
  let exampleFilename;
  if (isEqualMonthAndYear(dueReportPeriod.start, dueReportPeriod.end)) {
    exampleFilename = `${dueReportPeriod.start.month}-${dueReportPeriod.start.year}`;
  } else if (dueReportPeriod.start.year === dueReportPeriod.end.year) {
    exampleFilename = `${dueReportPeriod.start.month}-${dueReportPeriod.end.month}-${dueReportPeriod.start.year}`;
  } else {
    exampleFilename = `${dueReportPeriod.start.month}-${dueReportPeriod.start.year}-${dueReportPeriod.end.month}-${dueReportPeriod.end.year}`;
  }

  const singleDigitMonthRegex = /(?<!\d)(\d{1}-)/g;
  const replacePattern = '0$1';
  return exampleFilename.replaceAll(singleDigitMonthRegex, replacePattern);
};

/**
 * @typedef FilenameValidationError
 * @property {string} [filenameError]
 */

/**
 * Validates that the filename has the correct format for the supplied report period
 * using the monthly formatting options
 * @param {string} filename - The filename
 * @param {import('@ukef/dtfs2-common').ReportPeriod} dueReportPeriod - The due report period in format `MMM YYYY`
 * @returns {FilenameValidationError}
 */
const validateMonthlyFilename = (filename, dueReportPeriod) => {
  const filenameContainsMonthly = /monthly/i.test(filename);
  if (!filenameContainsMonthly) {
    const filenameError = "The selected file must contain the word 'monthly'";
    return { filenameError };
  }

  const { month, year } = dueReportPeriod.start;

  const monthRegexString = getMonthRegexString(month);
  const filenameReportPeriodRegex = getFilenameReportPeriodRegex(monthRegexString, year);

  const filenameContainsReportPeriod = filenameReportPeriodRegex.test(filename);
  if (!filenameContainsReportPeriod) {
    const exampleFilenameReportPeriod = getExampleFilenameReportPeriod(dueReportPeriod);
    const filenameError = `The selected file must contain the reporting period as part of its name, for example '${exampleFilenameReportPeriod}'`;
    return { filenameError };
  }
  return {};
};

/**
 * Validates that the filename has the correct format for the supplied report period
 * using the quarterly formatting options
 * @param {string} filename - The filename
 * @param {import('@ukef/dtfs2-common').ReportPeriod} dueReportPeriod - The due report period
 * @returns {FilenameValidationError}
 */
const validateQuarterlyFilename = (filename, dueReportPeriod) => {
  const filenameContainsQuarterly = /quarterly/i.test(filename);
  if (!filenameContainsQuarterly) {
    const filenameError = "The selected file must contain the word 'quarterly'";
    return { filenameError };
  }

  const startMonthRegexString = getMonthRegexString(dueReportPeriod.start.month);
  const endMonthRegexString = getMonthRegexString(dueReportPeriod.end.month);

  const isReportPeriodYearOverlapping = dueReportPeriod.start.year === dueReportPeriod.end.year;
  const filenameReportPeriodRegex = isReportPeriodYearOverlapping
    ? getFilenameReportPeriodRegex(startMonthRegexString, endMonthRegexString, dueReportPeriod.start.year)
    : getFilenameReportPeriodRegex(startMonthRegexString, dueReportPeriod.start.year, endMonthRegexString, dueReportPeriod.end.year);

  if (!filenameReportPeriodRegex.test(filename)) {
    const exampleFilenameReportPeriod = getExampleFilenameReportPeriod(dueReportPeriod);
    const filenameError = `The selected file must contain the reporting period as part of its name, for example '${exampleFilenameReportPeriod}'`;
    return { filenameError };
  }
  return {};
};

/**
 * Given a filename and a report period, this function checks whether
 * or not the filename contains a month and, if it does, whether or
 * not the month matches the report period passed in. If it does match,
 * it returns an empty object. Otherwise, it returns an object containing
 * a filename error message related to the specific case reached
 * @param {string} filename - The filename, using either '_' or '-' as a separator
 * @param {import('@ukef/dtfs2-common').ReportPeriod} dueReportPeriod - The due report period
 * @returns {FilenameValidationError}
 */
const validateFilenameFormat = (filename, dueReportPeriod) => {
  if (filename.includes(FILE_UPLOAD.FILENAME_SUBMITTED_INDICATOR)) {
    const filenameError = `Report filename must not contain '${FILE_UPLOAD.FILENAME_SUBMITTED_INDICATOR}'`;
    return { filenameError };
  }

  const isMonthlyReportPeriod = isEqualMonthAndYear(dueReportPeriod.start, dueReportPeriod.end);
  if (isMonthlyReportPeriod) {
    return validateMonthlyFilename(filename, dueReportPeriod);
  }
  return validateQuarterlyFilename(filename, dueReportPeriod);
};

module.exports = {
  validateCsvData,
  validateCsvHeaders,
  validateCsvCellData,
  validateFilenameFormat,
};
