const { CURRENCY_NUMBER_REGEX } = require('../../../../constants/regex');

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

module.exports = { generateFacilityUtilisationError };
