const { UTILISATION_REPORT_HEADERS } = require('../../../constants/utilisationReportHeaders');
const REGEXES = require('../../../constants/regex');
const {
  validateUkefId,
  validateExporter,
  validateBaseCurrency,
  validateFacilityUtilisation,
  validateTotalFeesAccrued,
  validateMonthlyFeesPaid,
  validatePaymentCurrency,
  validateExchangeRate,
} = require('./utilisation-data-validator');

/**
 * Validates the month of the utilisation report. Returns null if valid, otherwise returns an error message.
 * @param {unknown} month - Month of utilisation report.
 * @returns {String | null} - Error message or null if valid.
 */
const validateMonth = (month) => {
  if (!month) {
    return 'Month is required';
  }
  if (!REGEXES.INTEGER_REGEX.test(month) || month < 1 || month > 12) {
    return 'Month must be between 1 and 12';
  }
  return null;
};

/**
 * Validates the year of the utilisation report. Returns null if valid, otherwise returns an error message.
 * @param {unknown} year - year of utilisation report.
 * @returns {String | null} - Error message or null if valid.
 */
const validateYear = (year) => {
  if (!year) {
    return 'Year is required';
  }
  if (!REGEXES.INTEGER_REGEX.test(year) || year < 2020 || year > 2100) {
    return 'Year must be between 2020 and 2100';
  }
  return null;
};

/**
 * Validates the file path of the utilisation report in azure. Returns null if valid, otherwise returns an error message.
 * @param {unknown} filePath - file path of the utilisation report in azure.
 * @returns {String | null} - Error message or null if valid.
 */
const validateFilePath = (filePath) => {
  if (!filePath) {
    return 'File path is required';
  }
  if (filePath) {
    if (typeof filePath !== 'string') {
      return 'File path must be a string';
    }
  }
  return null;
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
    const monthlyFeesPaidValidationError = validateMonthlyFeesPaid(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.MONTHLY_FEES_PAID], index);
    const paymentCurrencyValidationError = validatePaymentCurrency(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY], index);
    const exchangeRateValidationError = validateExchangeRate(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.EXCHANGE_RATE], index);

    const validationErrors = [
      facilityIdValidationError,
      exporterValidationError,
      baseCurrencyValidationError,
      facilityUtilisationValidationError,
      totalFeesAccruedValidationError,
      monthlyFeesPaidValidationError,
      paymentCurrencyValidationError,
      exchangeRateValidationError,
    ].filter((error) => error);

    return validationErrors;
  });
  return errors;
};

module.exports = {
  validateUtilisationReportData, validateMonth, validateYear, validateFilePath, validateBankId
};
