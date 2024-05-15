const { requiredFieldsArray, filterErrorList } = require('./pageFields');

const validationErrorsCount = (validationErrors, fields) => {
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

module.exports = {
  isCompleted,
  validationErrorsCount,
};
