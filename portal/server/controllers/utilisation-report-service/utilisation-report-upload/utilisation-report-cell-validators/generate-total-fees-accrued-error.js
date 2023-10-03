const { CURRENCY_NUMBER_REGEX } = require('../../../../constants/regex');

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
  if (!CURRENCY_NUMBER_REGEX.test(totalFeesAccruedObject?.value)) {
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

module.exports = { generateTotalFeesAccruedError };
