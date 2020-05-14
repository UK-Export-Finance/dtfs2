import FIELDS from '../pageFields/bond';
import {
  allRequiredFieldsArray,
  getFieldErrors,
} from '../../../helpers/pageFields';

export const validationErrorsCount = (validationErrors, fields) => {
  const allRequiredFields = allRequiredFieldsArray(fields);
  const requiredFieldErrors = getFieldErrors(validationErrors, allRequiredFields);

  return Object.keys(requiredFieldErrors).length;
};

const isCompleted = (validationErrors, fields) => {
  const errorsCount = validationErrorsCount(validationErrors, fields);

  if (errorsCount === 0) {
    return true;
  }
  return false;
};

const bondCompletedStatus = (validationErrors) => ({
  bondDetails: isCompleted(validationErrors, FIELDS.DETAILS),
  bondFinancialDetails: isCompleted(validationErrors, FIELDS.FINANCIAL_DETAILS),
  bondFeeDetails: isCompleted(validationErrors, FIELDS.FEE_DETAILS),
});

export default bondCompletedStatus;
