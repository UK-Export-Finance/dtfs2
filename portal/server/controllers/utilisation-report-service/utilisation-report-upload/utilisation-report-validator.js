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
 * Given a filename and a report period, this function checks whether
 * or not the filename contains a month and, if it does, whether or
 * not the month matches the report period passed in. If it does match,
 * it returns an empty object. Otherwise, it returns an object containing
 * a filename error message related to the specific case reached
 * @param {string} filename - The filename, using either '_' or '-' as a separator
 * @param {string} dueReportPeriod - The current due report period formatted
 * @returns {{ filenameError: string | undefined }}
 */
const validateFilenameFormat = (filename, dueReportPeriod) => {
  const splitReportPeriod = dueReportPeriod.split(' ');

  let expectedExpression = '';
  splitReportPeriod.map((splitText, index) => {
    const month = Object.values(MONTH_NAMES).find(({ long }) => long === splitText);
    if (index !== 0) {
      expectedExpression += `[-_]`;
    }
    if (month) {
      expectedExpression += `(${month.long}|${month.short}|${month.numeric})`;
    } else {
      expectedExpression += `${splitText}`;
    }
    return expectedExpression;
  });
  
  const expectedRegex = new RegExp(expectedExpression, 'i');
  
  if (!expectedRegex.test(filename)) {
    const filenameError = `The selected file must contain the reporting period as part of its name, for example '${dueReportPeriod}'`;
    return { filenameError };
  }

  if (filename.includes(FILE_UPLOAD.FILENAME_SUBMITTED_INDICATOR)) {
    const filenameError = `Report filename must not contain '${FILE_UPLOAD.FILENAME_SUBMITTED_INDICATOR}'`;
    return { filenameError };
  }

  return {};
};

module.exports = {
  validateCsvData,
  validateCsvHeaders,
  validateCsvCellData,
  validateFilenameFormat,
};
