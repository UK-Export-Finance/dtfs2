const { UTILISATION_REPORT_HEADERS } = require('../../../constants');
const REGEXES = require('../../../constants/regex');
const {
  validateUkefId,
  validateExporter,
  validateBaseCurrency,
  validateFacilityUtilisation,
  validateTotalFeesAccrued,
  validateTotalFeesAccruedCurrency,
  validateTotalFeesAccruedExchangeRate,
  validateMonthlyFeesPaid,
  validateMonthlyFeesPaidCurrency,
  validatePaymentCurrency,
  validatePaymentExchangeRate,
} = require('./utilisation-data-validator');

/**
 * Validates the month of the utilisation report. Returns null if valid, otherwise returns an error message.
 * @param {unknown} month - Month of utilisation report.
 * @param {string} propertyName - String used in errors.
 * @returns {string | null} - Error message or null if valid.
 */
const validateMonth = (month, propertyName) => {
  if (!month) {
    return `${propertyName} is required`;
  }
  if (!REGEXES.INTEGER_REGEX.test(month) || month < 1 || month > 12) {
    return `${propertyName} must be between 1 and 12`;
  }
  return null;
};

/**
 * Validates the year of the utilisation report. Returns null if valid, otherwise returns an error message.
 * @param {unknown} year - year of utilisation report.
 * @param {string} propertyName - String used in errors.
 * @returns {string | null} - Error message or null if valid.
 */
const validateYear = (year, propertyName) => {
  if (!year) {
    return `${propertyName} is required`;
  }
  if (!REGEXES.INTEGER_REGEX.test(year) || year < 2020 || year > 2100) {
    return `${propertyName} must be between 2020 and 2100`;
  }
  return null;
};

/**
 * Validates the report period for the utilisation report
 * @param {unknown} reportPeriod - details of the report period.
 * @returns {string[]} - an array of errors or an empty array if valid.
 */
const validateReportPeriod = (reportPeriod) => {
  if (!reportPeriod) {
    return ['Report period is required'];
  }

  const reportPeriodErrors = [];
  const { month: startMonth, year: startYear,  } = reportPeriod.start;
  const { month: endMonth, year: endYear } = reportPeriod.end;
  const validateStartMonth = validateMonth(startMonth, 'startMonth');
  if (validateStartMonth !== null) {
    reportPeriodErrors.push(validateStartMonth)
  }
  const validateStartYear = validateYear(startYear, 'startYear');
  if (validateStartYear !== null) {
    reportPeriodErrors.push(validateStartYear)
  }
  const validateEndMonth = validateMonth(endMonth, 'endMonth');
  if (validateEndMonth !== null) {
    reportPeriodErrors.push(validateEndMonth)
  }
  const validateEndYear = validateYear(endYear, 'endYear');
  if (validateEndYear !== null) {
    reportPeriodErrors.push(validateEndYear)
  }

  return reportPeriodErrors;
};

/**
 * Validates the details of the file storage for the utilisation report in azure
 * @param {unknown} fileInfo - details of the file storage for the utilisation report in azure.
 * @returns {string[]} - an array of errors or an empty array if valid.
 */
const validateFileInfo = (fileInfo) => {
  if (!fileInfo) {
    return ['File info is required'];
  }

  const fileInfoErrors = [];
  const {
    folder, filename, fullPath, url, mimetype
  } = fileInfo;
  if (!folder) {
    fileInfoErrors.push('Folder name from file info is required');
  } else if (typeof folder !== 'string') {
    fileInfoErrors.push('Folder name from file info must be a string');
  }
  if (!filename) {
    fileInfoErrors.push('Filename from file info is required');
  } else if (typeof filename !== 'string') {
    fileInfoErrors.push('Filename from file info must be a string');
  }
  if (!fullPath) {
    fileInfoErrors.push('Full path from file info is required');
  } else if (typeof fullPath !== 'string') {
    fileInfoErrors.push('Full path from file info must be a string');
  }
  if (!url) {
    fileInfoErrors.push('Url from file info is required');
  } else if (typeof url !== 'string') {
    fileInfoErrors.push('Url from file info must be a string');
  }
  if (!mimetype) {
    fileInfoErrors.push('Mimetype from file info is required');
  } else if (typeof mimetype !== 'string') {
    fileInfoErrors.push('Mimetype from file info must be a string');
  }
  return fileInfoErrors;
};

/**
 * Validates the bank id. Returns null if valid, otherwise returns an error message.
 * @param {unknown} bankId - file path of the utilisation report in azure.
 * @returns {String | null} - Error message or null if valid.
 */
const validateBankId = (bankId) => {
  if (!bankId) {
    return 'Bank id is required';
  }
  if (!REGEXES.INTEGER_REGEX.test(bankId)) {
    return 'Bank id is not valid';
  }
  return null;
};

/**
 * Validates the utilisation report data. Returns an array of error messages.
 * @param {object[]} utilisationReportData - array of json objects representing utilisation report data.
 * @returns {object[]} - Array of error objects.
 */
const validateUtilisationReportData = (utilisationReportData) => {
  const errors = utilisationReportData.flatMap((utilisationReportDataEntry, index) => {
    const facilityIdValidationError = validateUkefId(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID], index);
    const exporterValidationError = validateExporter(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.EXPORTER], index);
    const baseCurrencyValidationError = validateBaseCurrency(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY], index);
    const facilityUtilisationValidationError = validateFacilityUtilisation(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION], index);
    const totalFeesAccruedValidationError = validateTotalFeesAccrued(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED], index);
    const totalFeesAccruedCurrencyValidationError = validateTotalFeesAccruedCurrency(
      utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_CURRENCY],
      index,
    );
    const totalFeesAccruedExchangeRateValidationError = validateTotalFeesAccruedExchangeRate(
      utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED_EXCHANGE_RATE],
      index,
    );
    const monthlyFeesPaidValidationError = validateMonthlyFeesPaid(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD], index);
    const monthlyFeesPaidCurrencyValidationError = validateMonthlyFeesPaidCurrency(
      utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.FEES_PAID_IN_PERIOD_CURRENCY],
      index,
    );
    const paymentCurrencyValidationError = validatePaymentCurrency(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY], index);
    const paymentExchangeRateValidationError = validatePaymentExchangeRate(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_EXCHANGE_RATE], index);

    const validationErrors = [
      facilityIdValidationError,
      exporterValidationError,
      baseCurrencyValidationError,
      facilityUtilisationValidationError,
      totalFeesAccruedValidationError,
      totalFeesAccruedCurrencyValidationError,
      totalFeesAccruedExchangeRateValidationError,
      monthlyFeesPaidValidationError,
      monthlyFeesPaidCurrencyValidationError,
      paymentCurrencyValidationError,
      paymentExchangeRateValidationError,
    ].filter((error) => error);

    return validationErrors;
  });
  return errors;
};

module.exports = {
  validateUtilisationReportData,
  validateMonth,
  validateYear,
  validateReportPeriod,
  validateFileInfo,
  validateBankId,
};
