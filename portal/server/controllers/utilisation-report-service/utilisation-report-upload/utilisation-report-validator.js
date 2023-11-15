const {
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
  generateMonthlyFeesPaidError,
  generateTotalFeesAccruedError,
  generatePaymentCurrencyError,
  generateExchangeRateError,
} = require('./utilisation-report-cell-validators');
const { UTILISATION_REPORT_HEADERS, MONTH_NAMES } = require('../../../constants');

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

const filenameContainsReportingPeriod = (filename) => {
  let containsReportPeriod = false;
  let monthInFilename;
  // Do I want to be case sensitive?
  Object.values(MONTH_NAMES).some(({ longName, shortName }) => {
    containsReportPeriod = filename.includes(longName) || filename.includes(shortName);
    if (containsReportPeriod) {
      monthInFilename = longName;
    }
    return containsReportPeriod;
  });
  return { containsReportPeriod, monthInFilename };
};

const validateFilenameContainsReportPeriod = (filename, currentReportPeriod) => {
  const expectedFilenameReportPeriod = currentReportPeriod.replace(' ', '_');

  const { containsReportPeriod, monthInFilename } = filenameContainsReportingPeriod(filename);
  if (!containsReportPeriod) {
    const filenameError = `The selected file must contain the reporting period as part of its name, for example '${expectedFilenameReportPeriod}'`;
    return { filenameError };
  }

  const currentReportPeriodYear = currentReportPeriod.split(' ').at(-1); // Expected format 'MMMM yyyy'
  const filenameReportPeriod = `${monthInFilename}_${currentReportPeriodYear}`;
  const filenameReportPeriodMatches = filenameReportPeriod === expectedFilenameReportPeriod;

  if (filenameReportPeriodMatches) {
    return {};
  }

  const filenameError = `The selected file must be the ${currentReportPeriod} report`;
  return { filenameError };
};

module.exports = {
  validateCsvData,
  validateCsvHeaders,
  validateCsvCellData,
  filenameContainsReportingPeriod,
  validateFilenameContainsReportPeriod,
};
