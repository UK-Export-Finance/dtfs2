const validator = require('validator');
const { HEADERS } = require('../../../constants');

const generateUkefFacilityIdError = (facilityIdObject, exporterName) => {
  if (!facilityIdObject?.value) {
    return {
      errorMessage: 'UKEF facility ID must have an entry',
      column: facilityIdObject?.column,
      row: facilityIdObject?.row,
      value: facilityIdObject?.value,
      exporter: exporterName,
    };
  }
  if (!/^\d{8,10}$/.test(facilityIdObject?.value)) {
    return {
      errorMessage: 'UKEF facility ID must be an 8 to 10 digit number',
      column: facilityIdObject?.column,
      row: facilityIdObject?.row,
      value: facilityIdObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};

const generateBaseCurrencyError = (baseCurrencyObject, exporterName) => {
  if (!baseCurrencyObject?.value) {
    return {
      errorMessage: 'Base currency must have an entry',
      column: baseCurrencyObject?.column,
      row: baseCurrencyObject?.row,
      value: baseCurrencyObject?.value,
      exporter: exporterName,
    };
  }
  if (!validator.isISO4217(baseCurrencyObject?.value)) {
    return {
      errorMessage: 'Base currency must be in the ISO 4217 currency code format',
      column: baseCurrencyObject?.column,
      row: baseCurrencyObject?.row,
      value: baseCurrencyObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};

const generateFacilityUtilisationError = (facilityUtilisationObject, exporterName) => {
  if (!facilityUtilisationObject?.value) {
    return {
      errorMessage: 'Facility utilisation must have an entry',
      column: facilityUtilisationObject?.column,
      row: facilityUtilisationObject?.row,
      value: facilityUtilisationObject?.value,
      exporter: exporterName,
    };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(facilityUtilisationObject?.value)) {
    return {
      errorMessage: 'Facility utilisation must be a number',
      column: facilityUtilisationObject?.column,
      row: facilityUtilisationObject?.row,
      value: facilityUtilisationObject?.value,
      exporter: exporterName,
    };
  }
  if (facilityUtilisationObject?.value?.length > 15) {
    return {
      errorMessage: 'Facility utilisation must be 15 characters or less',
      column: facilityUtilisationObject?.column,
      row: facilityUtilisationObject?.row,
      value: facilityUtilisationObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};

const generateTotalFeesAccruedError = (totalFeesAccruedObject, exporterName) => {
  if (!totalFeesAccruedObject?.value) {
    return {
      errorMessage: 'Total fees accrued for the month must have an entry',
      column: totalFeesAccruedObject?.column,
      row: totalFeesAccruedObject?.row,
      value: totalFeesAccruedObject?.value,
      exporter: exporterName,
    };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(totalFeesAccruedObject?.value)) {
    return {
      errorMessage: 'Total fees accrued for the month must be a number',
      column: totalFeesAccruedObject?.column,
      row: totalFeesAccruedObject?.row,
      value: totalFeesAccruedObject?.value,
      exporter: exporterName,
    };
  }
  if (totalFeesAccruedObject?.value?.length > 15) {
    return {
      errorMessage: 'Total fees accrued for the month must be 15 characters or less',
      column: totalFeesAccruedObject?.column,
      row: totalFeesAccruedObject?.row,
      value: totalFeesAccruedObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};

const generateMonthlyFeesPaidError = (monthlyFeesPaidObject, exporterName) => {
  if (!monthlyFeesPaidObject?.value) {
    return {
      errorMessage: 'Monthly fees paid to UKEF must have an entry',
      column: monthlyFeesPaidObject?.column,
      row: monthlyFeesPaidObject?.row,
      value: monthlyFeesPaidObject?.value,
      exporter: exporterName,
    };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(monthlyFeesPaidObject?.value)) {
    return {
      errorMessage: 'Monthly fees paid to UKEF must be a number',
      column: monthlyFeesPaidObject?.column,
      row: monthlyFeesPaidObject?.row,
      value: monthlyFeesPaidObject?.value,
      exporter: exporterName,
    };
  }
  if (monthlyFeesPaidObject?.value.length > 15) {
    return {
      errorMessage: 'Monthly fees paid to UKEF must be 15 characters or less',
      column: monthlyFeesPaidObject?.column,
      row: monthlyFeesPaidObject?.row,
      value: monthlyFeesPaidObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};

const generatePaymentCurrencyError = (paymentCurrencyObject, exporterName) => {
  if (!paymentCurrencyObject?.value) {
    return null;
  }
  if (!validator.isISO4217(paymentCurrencyObject?.value)) {
    return {
      errorMessage: 'Payment currency must be in the ISO 4217 currency code format',
      column: paymentCurrencyObject?.column,
      row: paymentCurrencyObject?.row,
      value: paymentCurrencyObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};

const generateExchangeRateError = (csvDataRow) => {
  if (!csvDataRow[HEADERS.PAYMENT_CURRENCY]?.value || csvDataRow[HEADERS.PAYMENT_CURRENCY]?.value === csvDataRow[HEADERS.BASE_CURRENCY]?.value) {
    return null;
  }
  if (!csvDataRow[HEADERS.EXCHANGE_RATE]?.value) {
    return {
      errorMessage: 'Exchange rate must have an entry',
      column: csvDataRow[HEADERS.EXCHANGE_RATE]?.column,
      row: csvDataRow[HEADERS.EXCHANGE_RATE]?.row,
      value: csvDataRow[HEADERS.EXCHANGE_RATE]?.value,
      exporter: csvDataRow[HEADERS.EXPORTER]?.value,
    };
  }
  if (!/^\d+(\.\d+)?$/.test(csvDataRow[HEADERS.EXCHANGE_RATE]?.value)) {
    return {
      errorMessage: 'Exchange rate must be a number',
      column: csvDataRow[HEADERS.EXCHANGE_RATE]?.column,
      row: csvDataRow[HEADERS.EXCHANGE_RATE]?.row,
      value: csvDataRow[HEADERS.EXCHANGE_RATE]?.value,
      exporter: csvDataRow[HEADERS.EXPORTER]?.value,
    };
  }
  if (csvDataRow[HEADERS.EXCHANGE_RATE]?.value.length > 15) {
    return {
      errorMessage: 'Exchange rate must be 15 characters or less',
      column: csvDataRow[HEADERS.EXCHANGE_RATE]?.column,
      row: csvDataRow[HEADERS.EXCHANGE_RATE]?.row,
      value: csvDataRow[HEADERS.EXCHANGE_RATE]?.value,
      exporter: csvDataRow[HEADERS.EXPORTER]?.value,
    };
  }
  return null;
};

module.exports = {
    generateUkefFacilityIdError,
    generateBaseCurrencyError,
    generateFacilityUtilisationError,
    generateTotalFeesAccruedError,
    generateMonthlyFeesPaidError,
    generatePaymentCurrencyError,
    generateExchangeRateError,
}