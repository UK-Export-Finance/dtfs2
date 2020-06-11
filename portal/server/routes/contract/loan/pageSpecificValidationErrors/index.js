import { pageSpecificValidationErrors } from '../../../../helpers';
import FIELDS from '../pageFields';

export const loanGuaranteeDetailsValidationErrors = (validationErrors, loan) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.GUARANTEE_DETAILS, loan);

export const loanFinancialDetailsValidationErrors = (validationErrors, loan) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.FINANCIAL_DETAILS, loan);
