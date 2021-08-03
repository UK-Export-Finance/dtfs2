import FIELDS from '../pageFields';
import isCompleted from '../../../../helpers/formCompleted';

const completedBondForms = (validationErrors) => ({
  bondDetails: isCompleted(validationErrors, FIELDS.DETAILS),
  bondFinancialDetails: isCompleted(validationErrors, FIELDS.FINANCIAL_DETAILS),
  bondFeeDetails: isCompleted(validationErrors, FIELDS.FEE_DETAILS),
});

export default completedBondForms;
