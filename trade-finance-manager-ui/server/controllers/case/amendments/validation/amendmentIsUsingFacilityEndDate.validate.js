const { validationErrorHandler } = require('../../../../helpers/validationErrorHandler.helper');

const isUsingFacilityEndDateValidation = (isUsingFacilityEndDate) => {
  const amendmentRequestIsUsingFacilityEndDateErrors = [];
  if (isUsingFacilityEndDate == null) {
    amendmentRequestIsUsingFacilityEndDateErrors.push({
      errRef: 'isUsingFacilityEndDate',
      errMsg: 'Select if the bank has provided an end date for this facility',
    });
  }

  return {
    errors: validationErrorHandler(amendmentRequestIsUsingFacilityEndDateErrors),
  };
};

module.exports = { isUsingFacilityEndDateValidation };
