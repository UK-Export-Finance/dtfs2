const validator = require('validator');

const generateMonthlyFeesPaidCurrencyError = (monthlyFeesPaidToUkefCurrencyObject, exporterName) => {
  if (!monthlyFeesPaidToUkefCurrencyObject?.value) {
    return {
      errorMessage: 'Fees paid to UKEF currency must have an entry',
      column: monthlyFeesPaidToUkefCurrencyObject?.column,
      row: monthlyFeesPaidToUkefCurrencyObject?.row,
      value: monthlyFeesPaidToUkefCurrencyObject?.value,
      exporter: exporterName,
    };
  }
  if (!validator.isISO4217(monthlyFeesPaidToUkefCurrencyObject?.value)) {
    return {
      errorMessage: 'Fees paid to UKEF currency must be in the ISO 4217 currency code format',
      column: monthlyFeesPaidToUkefCurrencyObject?.column,
      row: monthlyFeesPaidToUkefCurrencyObject?.row,
      value: monthlyFeesPaidToUkefCurrencyObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};

module.exports = {
    generateMonthlyFeesPaidCurrencyError,
};
