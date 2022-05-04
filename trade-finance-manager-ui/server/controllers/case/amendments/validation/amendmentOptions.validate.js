const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');

const amendmentOptionsValidation = (amendmentOptions) => {
  const amendmentOptionsValidationErrors = [];

  if (!amendmentOptions) {
    amendmentOptionsValidationErrors.push({
      errRef: 'amendmentOptions',
      errMsg: 'Select if the bank would like to change the cover end date, facility value or both',
    });

    const errorsObject = {
      errors: validationErrorHandler(amendmentOptionsValidationErrors),
    };

    return { errorsObject, amendmentOptionsValidationErrors };
  }
  return { errorsObject: {}, amendmentOptionsValidationErrors };
};

module.exports = { amendmentOptionsValidation };
