import FIELDS from '../pageFields';
import isCompleted from '../../../../helpers/pageCompletedStatus';

const bondCompletedStatus = (validationErrors) => ({
  bondDetails: isCompleted(validationErrors, FIELDS.DETAILS),
  bondFinancialDetails: isCompleted(validationErrors, FIELDS.FINANCIAL_DETAILS),
  bondFeeDetails: isCompleted(validationErrors, FIELDS.FEE_DETAILS),
});

export default bondCompletedStatus;
