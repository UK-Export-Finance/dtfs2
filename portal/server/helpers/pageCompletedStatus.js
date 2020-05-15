import {
  requiredFieldsArray,
  filterErrorList,
} from './pageFields';

export const validationErrorsCount = (validationErrors, fields) => {
  if (validationErrors.errorList) {
    const allRequiredFields = requiredFieldsArray(fields);
    const requiredFieldErrors = filterErrorList(validationErrors.errorList, allRequiredFields);

    return Object.keys(requiredFieldErrors).length;
  }
  return 0;
};

export const isCompleted = (validationErrors, fields) => {
  const errorsCount = validationErrorsCount(validationErrors, fields);

  if (errorsCount === 0) {
    return true;
  }
  return false;
};


export default isCompleted;
