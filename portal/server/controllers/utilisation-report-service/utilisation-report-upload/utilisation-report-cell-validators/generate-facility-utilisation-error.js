const { CURRENCY_NUMBER_REGEX } = require('../../../../constants/regex');
const { FILE_UPLOAD } = require('../../../../constants/file-upload');

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
  if (!CURRENCY_NUMBER_REGEX.test(facilityUtilisationObject?.value)) {
    return {
      errorMessage: 'Facility utilisation must be a number with a maximum of two decimal places',
      column: facilityUtilisationObject?.column,
      row: facilityUtilisationObject?.row,
      value: facilityUtilisationObject?.value,
      exporter: exporterName,
    };
  }
  if (facilityUtilisationObject?.value?.length > FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT) {
    return {
      errorMessage: `Facility utilisation must be ${FILE_UPLOAD.MAX_CELL_CHARACTER_COUNT} characters or less`,
      column: facilityUtilisationObject?.column,
      row: facilityUtilisationObject?.row,
      value: facilityUtilisationObject?.value,
      exporter: exporterName,
    };
  }
  return null;
};

module.exports = { generateFacilityUtilisationError };
