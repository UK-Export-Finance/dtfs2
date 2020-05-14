import { pageSpecificValidationErrors } from '../../../helpers';
import FIELDS from '../pageFields/bond';

export const bondDetailsValidationErrors = (validationErrors, bond) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.DETAILS, bond);

export const bondFinancialDetailsValidationErrors = (validationErrors, bond) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.FINANCIAL_DETAILS, bond);

export const bondFeeDetailsValidationErrors = (validationErrors, bond) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.FEE_DETAILS, bond);

// preview pages display all required field validation errors.
// because each field/validation error originates from  a different page,
// for each validation error, we need to add a hrefRoot to the page in question.
export const bondPreviewValidationErrors = (validationErrors, dealId, bondId) => {
  const mappedValidationErrors = validationErrors;

  if (mappedValidationErrors && mappedValidationErrors.errorList) {
    Object.keys(mappedValidationErrors.errorList).forEach((fieldName) => {
      if (FIELDS.DETAILS.REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/details`;
      }

      if (FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/financial-details`;
      }

      if (FIELDS.FEE_DETAILS.REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/bond/${bondId}/fee-details`;
      }
    });
  }

  return mappedValidationErrors;
};
