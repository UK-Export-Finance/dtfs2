// We should validate the data and the data will look something like
// const data = {
//     "facility utilisation": "",
//     "ukef facility id": "",
//     "base currency": "",
//     "total fees accrued for the month": "",
//     "monthly fees paid to ukef": "",
// }

// Errors can look like:
// [
//   {
//     errorMesage: 'Missing column',
//   },
//   {
//     error: 'Not String',
//     row: 3,
//     column: 'C',
//     value: 'abc',
//   },
// ];
const validator = require('validator');

const HEADERS = {
  UKEF_FACILITY_ID: 'ukef facility id',
  BASE_CURRENCY: 'base currency',
  FACILITY_UTILISATION: 'facility utilisation',
  TOTAL_FEES_ACCRUED: 'total fees accrued for the month',
  MONTHLY_FEES_PAID: 'monthly fees paid to ukef',
  EXPORTER: 'exporter',
  PAYMENT_CURRENCY: 'payment currency',
  EXCHANGE_RATE: 'exchange rate',
};

const validateCsvData = (csvData) => {
  const { missingHeaderErrors, availableHeaders } = validateCsvHeaders(csvData[0]);

  const dataValidationErrors = csvData
    .flatMap((value) => {
      const csvRowDataErrors = [];

      // If we have the UKEF Facility ID header, validate the UKEF Facility ID
      if (availableHeaders.contains(HEADERS.UKEF_FACILITY_ID)) {
        const ukefFacilityIdValidationError = generateUkefFacilityIdError(
          value[HEADERS.UKEF_FACILITY_ID],
          value.exporter?.value,
        );
        if (ukefFacilityIdValidationError) {
          csvRowDataErrors.push(ukefFacilityIdValidationError);
        }
      }

      if (availableHeaders.contains(HEADERS.BASE_CURRENCY)) {
        const baseCurrencyValidationError = generateBaseCurrencyError(
          value[HEADERS.BASE_CURRENCY],
          value.exporter?.value,
        );
        if (baseCurrencyValidationError) {
          csvRowDataErrors.push(baseCurrencyValidationError);
        }
      }

      if (availableHeaders.contains(HEADERS.FACILITY_UTILISATION)) {
        const facilityUtilisationValidationError = generateFacilityUtilisationError(
          value[HEADERS.FACILITY_UTILISATION],
          value.exporter?.value,
        );
        if (facilityUtilisationValidationError) {
          csvRowDataErrors.push(facilityUtilisationValidationError);
        }
      }

      if (availableHeaders.contains(HEADERS.TOTAL_FEES_ACCRUED)) {
        const totalFeesAccruedValidationError = generateTotalFeesAccruedError(
          value[HEADERS.TOTAL_FEES_ACCRUED],
          value.exporter?.value,
        );
        if (totalFeesAccruedValidationError) {
          csvRowDataErrors.push(totalFeesAccruedValidationError);
        }
      }

      if (availableHeaders.contains(HEADERS.MONTHLY_FEES_PAID)) {
        const monthlyFeesPaidValidationError = generateMonthlyFeesPaidError(
          value[HEADERS.MONTHLY_FEES_PAID],
          value.exporter?.value,
        );
        if (monthlyFeesPaidValidationError) {
          csvRowDataErrors.push(monthlyFeesPaidValidationError);
        }
      }

      return csvRowDataErrors;
    })
    .filter((errorObject) => (errorObject ? true : false));

  const validationErrors = missingHeaderErrors.concat(dataValidationErrors);

  console.log(validationErrors);

  return validationErrors;
};

const validateCsvHeaders = (csvDataRow) => {
  const headers = Object.keys(csvDataRow);
  const headerErrors = [];
  const availableHeaders = [];

  if (!isHeaderPresent(headers, HEADERS.UKEF_FACILITY_ID)) {
    headerErrors.push({ errorMessage: 'UKEF facility ID header is missing or spelt incorrectly', column: null, row: null, value: null, exporter: null });
  } else {
    availableHeaders.push(HEADERS.UKEF_FACILITY_ID);
  }

  if (!isHeaderPresent(headers, HEADERS.BASE_CURRENCY)) {
    headerErrors.push({ errorMessage: 'Base currency header is missing or spelt incorrectly', column: null, row: null, value: null, exporter: null });
  } else {
    availableHeaders.push(HEADERS.BASE_CURRENCY);
  }

  if (!isHeaderPresent(headers, HEADERS.FACILITY_UTILISATION)) {
    headerErrors.push({ errorMessage: 'Facility utilisation header is missing or spelt incorrectly', column: null, row: null, value: null, exporter: null });
  } else {
    availableHeaders.push(HEADERS.FACILITY_UTILISATION);
  }

  if (!isHeaderPresent(headers, HEADERS.TOTAL_FEES_ACCRUED)) {
    headerErrors.push({
      errorMessage: 'Total fees accrued for the month header is missing or spelt incorrectly',
      column: null,
      row: null,
      value: null,
      exporter: null,
    });
  } else {
    availableHeaders.push(HEADERS.TOTAL_FEES_ACCRUED);
  }

  if (!isHeaderPresent(headers, HEADERS.MONTHLY_FEES_PAID)) {
    headerErrors.push({
      errorMessage: 'Monthly fees paid to UKEF header is missing or spelt incorrectly',
      column: null,
      row: null,
      value: null,
      exporter: null,
    });
  } else {
    availableHeaders.push(HEADERS.MONTHLY_FEES_PAID);
  }

  return { headerErrors, availableHeaders };
};

const isHeaderPresent = (headers, headerToCheck) => {
  return headers.some((objectKey) => objectKey === headerToCheck);
};

const generateUkefFacilityIdError = (facilityIdObject, exporterName) => {
  if (!facilityIdObject.value) {
    return { errorMessage: 'UKEF facility ID is missing', column: facilityIdObject.column, row: facilityIdObject.row, value: facilityIdObject.value, exporter: exporterName };
  }
  if (!/^\d{8,10}$/.test(facilityIdObject.value)) {
    return { errorMessage: 'UKEF facility ID must be an 8 to 10 digit number', column: facilityIdObject.column, row: facilityIdObject.row, value: facilityIdObject.value, exporter: exporterName };
  }
  return null;
};

const generateBaseCurrencyError = (value, column, row, exporter) => {
  if (!value) {
    return { errorMessage: 'Base currency must have an entry', column, row, value, exporter };
  }
  if (!validator.isISO4217(value)) {
    return { errorMessage: 'Base currency must be in the ISO 4217 currency code format', column, row, value, exporter };
  }
  return null;
};

const generateFacilityUtilisationError = (value, column, row, exporter) => {
  if (!value) {
    return { errorMessage: 'Facility utilisation must have an entry', column, row, value, exporter };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return { errorMessage: 'Facility utilisation must be a number', column, row, value, exporter };
  }
  if (!value.length > 15) {
    return { errorMessage: 'Facility utilisation must be 15 characters or less', column, row, value, exporter };
  }
  return null;
};

const generateTotalFeesAccruedError = (value, column, row, exporter) => {
  if (!value) {
    return { errorMessage: 'Total fees accrued for the month must have an entry', column, row, value, exporter };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return { errorMessage: 'Total fees accrued for the month must be a number', column, row, value, exporter };
  }
  if (!value.length > 15) {
    return { errorMessage: 'Total fees accrued for the month must be 15 characters or less', column, row, value, exporter };
  }
  return null;
};

const generateMonthlyFeesPaidError = (value, column, row, exporter) => {
  if (!value) {
    return { errorMessage: 'Monthly fees paid to UKEF must have an entry', column, row, value, exporter };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return { errorMessage: 'Monthly fees paid to UKEF must be a number', column, row, value, exporter };
  }
  if (!value.length > 15) {
    return { errorMessage: 'Monthly fees paid to UKEF must be 15 characters or less', column, row, value, exporter };
  }
  return null;
};

const generatePaymentCurrencyError = (value, column, row, exporter) => {
  if (!(value && validator.isISO4217(value))) {
    return { errorMessage: 'Payment currency must be in the ISO 4217 currency code format', column, row, value, exporter };
  }
  return null;
};

const generateExchangeRateError = (value, column, row, exporter) => {
  if (!value) {
    return { errorMessage: 'Exchange rate must be entered as payment currency is different to base currency', column, row, value, exporter };
  }
  if (!/^\d+(\.\d+)?$/.test(value)) {
    return { errorMessage: 'Exchange rate must be a number', column, row, value, exporter };
  }
  if (!value.length > 30) {
    return { errorMessage: 'Exchange rate must be must be 30 characters or less', column, row, value, exporter };
  }
  return null;
};

module.exports = {
  validateCsvData,
  validateCsvHeaders,
  generateUkefFacilityIdError,
  generateBaseCurrencyError,
  generateFacilityUtilisationError,
};
