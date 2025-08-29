const FIELDS = require('../pageFields');
const { isCompleted } = require('../../../../helpers/formCompleted');

const completedBondForms = (validationErrors) => ({
  bondDetails: isCompleted(validationErrors, FIELDS.DETAILS),
  bondFinancialDetails: isCompleted(validationErrors, FIELDS.FINANCIAL_DETAILS),
  bondFeeDetails: isCompleted(validationErrors, FIELDS.FEE_DETAILS),
});

module.exports = completedBondForms;
