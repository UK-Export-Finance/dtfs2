const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');
const { formattedNumber } = require('../../../../helpers/number');

const amendFacilityValueValidation = (currentFacilityValue, newValue) => {
  const newFacilityValue = Number(newValue);
  const amendFacilityValueErrors = [];
  if (!newValue) {
    amendFacilityValueErrors.push({
      errRef: 'facilityValue',
      errMsg: 'Enter a new facility value',
    });
    const errorsObject = {
      errors: validationErrorHandler(amendFacilityValueErrors),
    };

    return { errorsObject, amendFacilityValueErrors };
  }

  if (Number.isNaN(newFacilityValue)) {
    amendFacilityValueErrors.push({
      errRef: 'facilityValue',
      errMsg: 'The new facility value must be a number',
    });
    const errorsObject = {
      errors: validationErrorHandler(amendFacilityValueErrors),
    };

    return { errorsObject, amendFacilityValueErrors };
  }

  const value = `${currency} ${formattedNumber(newFacilityValue)}`;

  if (currentFacilityValue === value) {
    amendFacilityValueErrors.push({
      errRef: 'facilityValue',
      errMsg: 'The new facility value cannot be the same as the current facility value',
    });
    const errorsObject = {
      errors: validationErrorHandler(amendFacilityValueErrors),
    };

    return { errorsObject, amendFacilityValueErrors };
  }
  return { errorsObject: {}, amendFacilityValueErrors: [] };
};

module.exports = { amendFacilityValueValidation };
