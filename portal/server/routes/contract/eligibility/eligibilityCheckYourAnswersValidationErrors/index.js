const FIELDS = require('../pageFields');

const eligibilityCheckYourAnswersValidationErrors = (validationErrors, dealId) => {
  const mappedValidationErrors = validationErrors;

  if (mappedValidationErrors && mappedValidationErrors.errorList) {
    Object.keys(mappedValidationErrors.errorList).forEach((fieldName) => {
      if (FIELDS.ELIGIBILITY_CRITERIA.REQUIRED_FIELDS.includes(fieldName) || FIELDS.ELIGIBILITY_CRITERIA.CONDITIONALLY_REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].href = `/contract/${dealId}/eligibility/criteria#criterion-group-${fieldName}`;
      }

      if (
        FIELDS.SUPPORTING_DOCUMENTATION.REQUIRED_FIELDS.includes(fieldName) ||
        FIELDS.SUPPORTING_DOCUMENTATION.CONDITIONALLY_REQUIRED_FIELDS.includes(fieldName)
      ) {
        mappedValidationErrors.errorList[fieldName].href = `/contract/${dealId}/eligibility/supporting-documentation#${fieldName}`;
      }
    });
  }

  return mappedValidationErrors;
};

module.exports = eligibilityCheckYourAnswersValidationErrors;
