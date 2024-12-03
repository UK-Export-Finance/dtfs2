const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');

const amendmentOptionsValidation = (amendmentOptions, hasBeenIssued) => {
  if (!amendmentOptions) {
    const amendmentOptionsValidationErrors = [];
    if (hasBeenIssued) {
      amendmentOptionsValidationErrors.push({
        errRef: 'amendmentOptions',
        errMsg: 'Select if the bank would like to change the cover end date, facility value or both',
      });
    } else {
      amendmentOptionsValidationErrors.push({
        errRef: 'amendmentOptions',
        errMsg: 'Select if the bank would like to change the facility value',
      });
    }

    const errorsObject = {
      errors: validationErrorHandler(amendmentOptionsValidationErrors),
    };

    return { errorsObject, amendmentOptionsValidationErrors };
  }
  return { errorsObject: {}, amendmentOptionsValidationErrors: [] };
};

module.exports = { amendmentOptionsValidation };
