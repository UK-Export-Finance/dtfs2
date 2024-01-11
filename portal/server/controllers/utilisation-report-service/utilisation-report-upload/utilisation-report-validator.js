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
const { UTILISATION_REPORT_HEADERS, MONTH_NAMES } = require('../../../constants');

const validateCsvHeaders = (csvDataRow) => {
  const headers = Object.keys(csvDataRow);
  const requiredHeaders = [
    { header: UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID, missingErrorMessage: 'UKEF facility ID header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.BASE_CURRENCY, missingErrorMessage: 'Base currency header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION, missingErrorMessage: 'Facility utilisation header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED, missingErrorMessage: 'Fees accrued since last report header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD, missingErrorMessage: 'Fees paid to UKEF for the period header is missing or spelt incorrectly' },
    { header: UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY, missingErrorMessage: 'Fees paid to UKEF currency header is missing or spelt incorrectly' },
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
  const expectedFilenameReportPeriod = dueReportPeriod.replace(' ', '_');
  const dueReportPeriodYear = dueReportPeriod.split(' ')[1];

  const regexPatterns = Object.values(MONTH_NAMES).map((monthName) => {
    const expression = `(${monthName.longName}|${monthName.shortName})[-_]\\d{4}`;
    const regex = new RegExp(expression, 'i');

    const expressionWithExactYear = `(${monthName.longName}|${monthName.shortName})[-_]${dueReportPeriodYear}`;
    const regexWithExactYear = new RegExp(expressionWithExactYear, 'i');

    return { regex, regexWithExactYear };
  });

  const allMatchingRegex = regexPatterns.filter(({ regex }) => regex.test(filename));
  if (allMatchingRegex.length === 0) {
    const filenameError = `The selected file must contain the reporting period as part of its name, for example '${expectedFilenameReportPeriod}'`;
    return { filenameError };
  }

  const specificReportPeriodRegex = allMatchingRegex.filter(({ regex }) => regex.test(expectedFilenameReportPeriod)).at(0);
  if (!specificReportPeriodRegex) {
    const filenameError = `The selected file must be the ${dueReportPeriod} report`;
    return { filenameError };
  }

  const { regexWithExactYear } = specificReportPeriodRegex;
  if (regexWithExactYear.test(filename)) {
    return {};
  }

  const filenameError = `The selected file must be the ${dueReportPeriod} report`;
  return { filenameError };
};

module.exports = {
  validateCsvData,
  validateCsvHeaders,
  validateCsvCellData,
  validateFilenameContainsReportPeriod,
};
