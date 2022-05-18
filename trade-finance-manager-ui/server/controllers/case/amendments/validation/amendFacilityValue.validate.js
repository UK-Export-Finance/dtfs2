const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');

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

  let value = newFacilityValue.toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  value = `GBP ${value}`;

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
