// NOTE:
// pageSpecificValidationErrors are required specifically to match the existing UX/UI.
// by having pageSpecificValidationErrors logic in the UI, we remain decoupled from the API.
// when the UX/UI is redesigned, we should only have to update the UI.
import errorHref from './errorHref';
import generateErrorSummary from './generateErrorSummary';

export const allRequiredFieldsArray = (fields) => {
  const { REQUIRED_FIELDS, CONDITIONALLY_REQUIRED_FIELDS } = fields;
  const allRequiredFields = [...REQUIRED_FIELDS];

  if (CONDITIONALLY_REQUIRED_FIELDS) {
    allRequiredFields.push(...CONDITIONALLY_REQUIRED_FIELDS);
  }

  return allRequiredFields;
};

export const allFieldsArray = (fields) => {
  const { OPTIONAL_FIELDS } = fields;
  const allFields = allRequiredFieldsArray(fields);

  if (OPTIONAL_FIELDS) {
    allFields.push(...OPTIONAL_FIELDS);
  }

  return allFields;
};

// only return validation if:
// any single field has been submitted for the given page (required, conditionally required or optional)
// or if the Preview page has been viewed (flag from api/db)
export const shouldReturnRequiredValidation = (fields, fieldValues) => {
  const allFields = allFieldsArray(fields);
  const { _id, status, ...strippedFieldValues } = fieldValues;

  const totalFieldValues = Object.keys(strippedFieldValues).filter((fieldName) =>
    allFields.includes(fieldName) && strippedFieldValues[fieldName].length > 0);

  if (totalFieldValues.length > 0 || fieldValues.viewedPreviewPage) {
    return true;
  }
  return false;
};

export const mapRequiredValidationErrors = (validationErrors, fields) => {
  const mappedErrors = validationErrors || {};
  const allRequiredFields = allRequiredFieldsArray(fields);

  const filteredErrorList = {};

  if (validationErrors) {
    Object.keys(validationErrors.errorList).forEach((error) => {
      if (allRequiredFields.includes(error)) {
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
