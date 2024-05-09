const { pageSpecificValidationErrors } = require('../../../../helpers');
const FIELDS = require('../pageFields');

exports.bondDetailsValidationErrors = (validationErrors, bond) => pageSpecificValidationErrors(validationErrors, FIELDS.DETAILS, bond);

exports.bondFinancialDetailsValidationErrors = (validationErrors, bond) => pageSpecificValidationErrors(validationErrors, FIELDS.FINANCIAL_DETAILS, bond);

exports.bondFeeDetailsValidationErrors = (validationErrors, bond) => pageSpecificValidationErrors(validationErrors, FIELDS.FEE_DETAILS, bond);

// preview pages display all required field validation errors.
// because each field/validation error originates from  a different page,
// for each validation error, we need to add a hrefRoot to the page in question.
exports.bondPreviewValidationErrors = (validationErrors, dealId, bondId) => {
  const mappedValidationErrors = validationErrors;

  if (mappedValidationErrors && mappedValidationErrors.errorList) {
    Object.keys(mappedValidationErrors.errorList).forEach((fieldName) => {
      if (FIELDS.DETAILS.REQUIRED_FIELDS.includes(fieldName) || FIELDS.DETAILS.CONDITIONALLY_REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/details`;
      }

      if (FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS.includes(fieldName) || FIELDS.FINANCIAL_DETAILS.CONDITIONALLY_REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/financial-details`;
      }

      if (FIELDS.FEE_DETAILS.REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/fee-details`;
      }
    });
  }

  return mappedValidationErrors;
};
