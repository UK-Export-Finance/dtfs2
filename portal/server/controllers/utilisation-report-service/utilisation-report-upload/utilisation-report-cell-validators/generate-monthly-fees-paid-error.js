const { CURRENCY_NUMBER_REGEX } = require('../../../../constants/regex');
const { FILE_UPLOAD } = require('../../../../constants/file-upload');

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
  if (!CURRENCY_NUMBER_REGEX.test(monthlyFeesPaidObject?.value)) {
    return {
      errorMessage: 'Monthly fees paid to UKEF must be a number',
      column: monthlyFeesPaidObject?.column,
      row: monthlyFeesPaidObject?.row,
      value: monthlyFeesPaidObject?.value,
      exporter: exporterName,
    };
  }
  if (monthlyFeesPaidObject?.value.length > FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT) {
    return {
      errorMessage: `Monthly fees paid to UKEF must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: monthlyFeesPaidObject?.column,
      row: monthlyFeesPaidObject?.row,
      value: monthlyFeesPaidObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};

module.exports = { generateMonthlyFeesPaidError };
