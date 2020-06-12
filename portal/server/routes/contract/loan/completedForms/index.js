import FIELDS from '../pageFields';
import isCompleted from '../../../../helpers/formCompleted';

const completedLoanForms = (validationErrors) => ({
  loanGuaranteeDetails: isCompleted(validationErrors, FIELDS.GUARANTEE_DETAILS),
  loanFinancialDetails: isCompleted(validationErrors, FIELDS.FINANCIAL_DETAILS),
});

export default completedLoanForms;
