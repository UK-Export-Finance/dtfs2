import errorHref from './errorHref';
import generateErrorSummary from './generateErrorSummary';

// only return validation if any single field has been submitted (required, conditionally required or optional).
export const shouldReturnRequiredValidation = (fields, fieldValues) => {
  const { _id, status, ...strippedFieldValues } = fieldValues;

  const totalFieldValues = Object.keys(strippedFieldValues).filter((fieldName) =>
    strippedFieldValues[fieldName].length > 0);

  if (totalFieldValues.length > 0) {
    return true;
  }
  return false;
};

export const mapRequiredValidationErrors = (validationErrors, fields) => {
  const mappedErrors = validationErrors || {};
  const { REQUIRED_FIELDS, CONDITIONALLY_REQUIRED_FIELDS } = fields;

  const filteredErrorList = {};

  if (validationErrors) {
    Object.keys(validationErrors.errorList).forEach((error) => {
      if (REQUIRED_FIELDS.includes(error)) {
        filteredErrorList[error] = validationErrors.errorList[error];
      } else if (CONDITIONALLY_REQUIRED_FIELDS && CONDITIONALLY_REQUIRED_FIELDS.includes(error)) {
        filteredErrorList[error] = validationErrors.errorList[error];
      }
    });
  }

  mappedErrors.errorList = filteredErrorList;

  return {
    ...generateErrorSummary(
      mappedErrors,
      errorHref,
    ),
    conditionalErrorList: mappedErrors.conditionalErrorList,
  };
};

export const pageSpecificValidationErrors = (validationErrors, fields, bond) => {
  if (shouldReturnRequiredValidation(fields, bond)) {
    return mapRequiredValidationErrors(validationErrors, fields);
  }
  return {
    conditionalErrorList: validationErrors.conditionalErrorList,
  };
};

export default pageSpecificValidationErrors;
