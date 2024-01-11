const { CURRENCY_NUMBER_REGEX } = require('../../../../constants/regex');
const { FILE_UPLOAD } = require('../../../../constants/file-upload');

const generateTotalFeesAccruedError = (totalFeesAccruedObject, exporterName) => {
  if (!totalFeesAccruedObject) {
    return {
      errorMessage: 'Fees accrued since last report must have an entry',
      exporter: exporterName,
    };
  }

  const { value, column, row } = totalFeesAccruedObject;

  const generateError = (errorMessage) => ({ errorMessage, column, row, value, exporter: exporterName });

  if (!value) {
    return generateError('Fees accrued since last report must have an entry');
  }
  if (!CURRENCY_NUMBER_REGEX.test(value)) {
    return generateError('Fees accrued since last report must be a number with a maximum of two decimal places');
  }
  if (value.length > FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT) {
    return generateError(`Fees accrued since last report must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`);
  }
  return null;
};

module.exports = { generateTotalFeesAccruedError };
