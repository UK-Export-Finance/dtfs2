const { CURRENCY_NUMBER_REGEX } = require('../../../../constants/regex');
const { FILE_UPLOAD } = require('../../../../constants/file-upload');

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
  if (totalFeesAccruedObject?.value?.length > FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT) {
    return {
      errorMessage: `Total fees accrued for the month must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: totalFeesAccruedObject?.column,
      row: totalFeesAccruedObject?.row,
      value: totalFeesAccruedObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};

module.exports = { generateTotalFeesAccruedError };
