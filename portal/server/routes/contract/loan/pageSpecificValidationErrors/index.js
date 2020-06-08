import { pageSpecificValidationErrors } from '../../../../helpers';
import FIELDS from '../pageFields';

export const loanGuaranteeDetailsValidationErrors = (validationErrors, bond) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.GUARANTEE_DETAILS, bond);

export const loanFinancialDetailsValidationErrors = (validationErrors, bond) =>
  pageSpecificValidationErrors(validationErrors, FIELDS.FINANCIAL_DETAILS, bond);
