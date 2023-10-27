const { UTILISATION_REPORT_HEADERS } = require('../../../constants/utilisationReportHeaders');
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
 * @param {Integer} month - Month of utilisation report.
 * @returns {String | null} - Error message or null if valid.
 */
const validateMonth = (month) => {
  if (!month) {
    return 'Month is required';
  }
  if (month < 1 || month > 12) {
    return 'Month must be between 1 and 12';
  }
  return null;
};

/**
 * Validates the year of the utilisation report. Returns null if valid, otherwise returns an error message.
 * @param {Integer} year - year of utilisation report.
 * @returns {String | null} - Error message or null if valid.
 */
const validateYear = (year) => {
  if (!year) {
    return 'Year is required';
  }
  if (year < 2020 || year > 2100) {
    return 'Year must be between 2020 and 2100';
  }
  return null;
};

/**
 * Validates the file path of the utilisation report in azure. Returns null if valid, otherwise returns an error message.
 * @param {Integer} filePath - file path of the utilisation report in azure.
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
 * Validates the utilisation report data. Returns an array of error messages.
 * @param {Array} utilisationReportData - array of json objects representing utilisation report data.
 * @returns {Array} - Array of string error messages.
 */
const validateUtilisationReportData = (utilisationReportData) => {
  const errors = utilisationReportData.flatMap((utilisationReportDataEntry) => {
    const facilityIdValidationError = validateUkefId(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.UKEF_FACILITY_ID]?.value);
    const exporterValidationError = validateExporter(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.EXPORTER]?.value);
    const baseCurrencyValidationError = validateBaseCurrency(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.BASE_CURRENCY]?.value);
    const facilityUtilisationValidationError = validateFacilityUtilisation(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.FACILITY_UTILISATION]?.value);
    const totalFeesAccruedValidationError = validateTotalFeesAccrued(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.TOTAL_FEES_ACCRUED]?.value);
    const monthlyFeesPaidValidationError = validateMonthlyFeesPaid(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.MONTHLY_FEES_PAID]?.value);
    const paymentCurrencyValidationError = validatePaymentCurrency(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.PAYMENT_CURRENCY]?.value);
    const exchangeRateValidationError = validateExchangeRate(utilisationReportDataEntry[UTILISATION_REPORT_HEADERS.EXCHANGE_RATE]?.value);

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

module.exports = { validateUtilisationReportData, validateMonth, validateYear, validateFilePath };
