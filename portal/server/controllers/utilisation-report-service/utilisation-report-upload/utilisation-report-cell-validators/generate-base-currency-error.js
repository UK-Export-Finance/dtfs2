const validator = require('validator');

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

module.exports = {
  generateBaseCurrencyError,
};
