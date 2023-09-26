// Errors can look like:
const {
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
  generateMonthlyFeesPaidError,
  generateTotalFeesAccruedError,
  generatePaymentCurrencyError,
  generateExchangeRateError,
} = require('./utilisation-report-cell-validators');
const { HEADERS } = require('../../../constants');

const validateCsvHeaders = (csvDataRow) => {
  const headers = Object.keys(csvDataRow);
  const missingHeaderErrors = [];
  const availableHeaders = [];

  if (!headers.includes(HEADERS.UKEF_FACILITY_ID)) {
    missingHeaderErrors.push({
      errorMessage: 'UKEF facility ID header is missing or spelt incorrectly',
      column: undefined,
      row: null,
      value: null,
      exporter: null,
    });
  } else {
    availableHeaders.push(HEADERS.UKEF_FACILITY_ID);
  }

  if (!headers.includes(HEADERS.BASE_CURRENCY)) {
    missingHeaderErrors.push({ errorMessage: 'Base currency header is missing or spelt incorrectly', column: null, row: null, value: null, exporter: null });
  } else {
    availableHeaders.push(HEADERS.BASE_CURRENCY);
  }

  if (!headers.includes(HEADERS.FACILITY_UTILISATION)) {
    missingHeaderErrors.push({
      errorMessage: 'Facility utilisation header is missing or spelt incorrectly',
      column: null,
      row: null,
      value: null,
      exporter: null,
    });
  } else {
    availableHeaders.push(HEADERS.FACILITY_UTILISATION);
  }

  if (!headers.includes(HEADERS.TOTAL_FEES_ACCRUED)) {
    missingHeaderErrors.push({
      errorMessage: 'Total fees accrued for the month header is missing or spelt incorrectly',
      column: null,
      row: null,
      value: null,
      exporter: null,
    });
  } else {
    availableHeaders.push(HEADERS.TOTAL_FEES_ACCRUED);
  }

  if (!headers.includes(HEADERS.MONTHLY_FEES_PAID)) {
    missingHeaderErrors.push({
      errorMessage: 'Monthly fees paid to UKEF header is missing or spelt incorrectly',
      column: null,
      row: null,
      value: null,
      exporter: null,
    });
  } else {
    availableHeaders.push(HEADERS.MONTHLY_FEES_PAID);
  }
  return { missingHeaderErrors, availableHeaders };
};

const validateCsvCellData = (csvData, availableHeaders) => csvData.flatMap((value, index) => {
  const csvDataErrors = [];

  // If we have the UKEF Facility ID header, validate the UKEF Facility ID
  if (availableHeaders.includes(HEADERS.UKEF_FACILITY_ID)) {
    const ukefFacilityIdValidationError = generateUkefFacilityIdError(value[HEADERS.UKEF_FACILITY_ID], value.exporter?.value, index + 1);
    if (ukefFacilityIdValidationError) {
      csvDataErrors.push(ukefFacilityIdValidationError);
    }
  }

  if (availableHeaders.includes(HEADERS.BASE_CURRENCY)) {
    const baseCurrencyValidationError = generateBaseCurrencyError(value[HEADERS.BASE_CURRENCY], value.exporter?.value, index + 1);
    if (baseCurrencyValidationError) {
      csvDataErrors.push(baseCurrencyValidationError);
    }
  }

  if (availableHeaders.includes(HEADERS.FACILITY_UTILISATION)) {
    const facilityUtilisationValidationError = generateFacilityUtilisationError(value[HEADERS.FACILITY_UTILISATION], value.exporter?.value, index + 1);
    if (facilityUtilisationValidationError) {
      csvDataErrors.push(facilityUtilisationValidationError);
    }
  }

  if (availableHeaders.includes(HEADERS.TOTAL_FEES_ACCRUED)) {
    const totalFeesAccruedValidationError = generateTotalFeesAccruedError(value[HEADERS.TOTAL_FEES_ACCRUED], value.exporter?.value, index + 1);
    if (totalFeesAccruedValidationError) {
      csvDataErrors.push(totalFeesAccruedValidationError);
    }
  }

  if (availableHeaders.includes(HEADERS.MONTHLY_FEES_PAID)) {
    const monthlyFeesPaidValidationError = generateMonthlyFeesPaidError(value[HEADERS.MONTHLY_FEES_PAID], value.exporter?.value, index + 1);
    if (monthlyFeesPaidValidationError) {
      csvDataErrors.push(monthlyFeesPaidValidationError);
    }
  }

  const paymentCurrencyValidationError = generatePaymentCurrencyError(value[HEADERS.PAYMENT_CURRENCY], value.exporter?.value, index + 1);
  if (paymentCurrencyValidationError) {
    csvDataErrors.push(paymentCurrencyValidationError);
  }

  const exchangeRateValidationError = generateExchangeRateError(value, index + 1);
  if (exchangeRateValidationError) {
    csvDataErrors.push(exchangeRateValidationError);
  }

  return csvDataErrors;
});

const validateCsvData = (csvData) => {
  const { missingHeaderErrors, availableHeaders } = validateCsvHeaders(csvData[0]);

  const dataValidationErrors = validateCsvCellData(csvData, availableHeaders);

  const validationErrors = missingHeaderErrors.concat(dataValidationErrors);

  return validationErrors;
};

module.exports = {
  validateCsvData,
  validateCsvHeaders,
  validateCsvCellData,
};
