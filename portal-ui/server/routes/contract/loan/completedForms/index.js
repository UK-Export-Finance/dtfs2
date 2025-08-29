const FIELDS = require('../pageFields');
const { isCompleted } = require('../../../../helpers/formCompleted');

const completedLoanForms = (validationErrors) => ({
  loanGuaranteeDetails: isCompleted(validationErrors, FIELDS.GUARANTEE_DETAILS),
  loanFinancialDetails: isCompleted(validationErrors, FIELDS.FINANCIAL_DETAILS),
  loanDatesRepayments: isCompleted(validationErrors, FIELDS.DATES_REPAYMENTS),
});

module.exports = completedLoanForms;
