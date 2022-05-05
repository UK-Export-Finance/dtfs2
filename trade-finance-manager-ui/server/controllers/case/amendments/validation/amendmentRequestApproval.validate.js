const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');

const requestApprovalValidation = (requireUkefApproval) => {
  const amendmentRequestApprovalErrors = [];
  if (!requireUkefApproval) {
    amendmentRequestApprovalErrors.push({
      errRef: 'requireUkefApproval',
      errMsg: 'Select yes if the amendment request needs UKEF approval',
    });
  }
  const errorsObject = {
    errors: validationErrorHandler(amendmentRequestApprovalErrors),
  };

  return { errorsObject, amendmentRequestApprovalErrors };
};

module.exports = { requestApprovalValidation };
