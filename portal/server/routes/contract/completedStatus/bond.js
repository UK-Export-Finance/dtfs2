import FIELDS from '../pageFields/bond';
import {
  requiredFieldsArray,
  filterErrorList,
} from '../../../helpers/pageFields';

// TODO: should it be something like pageValidationErrorsCount / field...
export const validationErrorsCount = (validationErrors, fields) => {
  if (validationErrors.errorList) {
    const allRequiredFields = requiredFieldsArray(fields);
    const requiredFieldErrors = filterErrorList(validationErrors.errorList, allRequiredFields);

    return Object.keys(requiredFieldErrors).length;
  }
  return 0;
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
