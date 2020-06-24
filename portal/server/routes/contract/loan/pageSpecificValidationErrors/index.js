import { pageSpecificValidationErrors } from '../../../../helpers';
import FIELDS from '../pageFields';

export const loanGuaranteeDetailsValidationErrors = (validationErrors, loan) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.GUARANTEE_DETAILS, loan);

export const loanFinancialDetailsValidationErrors = (validationErrors, loan) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.FINANCIAL_DETAILS, loan);

export const loanDatesRepaymentsValidationErrors = (validationErrors, loan) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.DATES_REPAYMENTS, loan);

// TODO: make reusable for bonds and loans.
// preview pages display all required field validation errors.
// because each field/validation error originates from  a different page,
// for each validation error, we need to add a hrefRoot to the page in question.
export const loanPreviewValidationErrors = (validationErrors, dealId, loanId) => {
  const mappedValidationErrors = validationErrors;

  if (mappedValidationErrors && mappedValidationErrors.errorList) {
    Object.keys(mappedValidationErrors.errorList).forEach((fieldName) => {
      if (FIELDS.GUARANTEE_DETAILS.REQUIRED_FIELDS.includes(fieldName)
        || FIELDS.GUARANTEE_DETAILS.CONDITIONALLY_REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/loan/${loanId}/guarantee-details`;
      }

      if (FIELDS.FINANCIAL_DETAILS.REQUIRED_FIELDS.includes(fieldName)
        || FIELDS.FINANCIAL_DETAILS.CONDITIONALLY_REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/loan/${loanId}/financial-details`;
      }

      if (FIELDS.DATES_REPAYMENTS.REQUIRED_FIELDS.includes(fieldName)) {
        mappedValidationErrors.errorList[fieldName].hrefRoot = `/contract/${dealId}/loan/${loanId}/dates-repayments`;
      }
    });
  }

  return mappedValidationErrors;
};
