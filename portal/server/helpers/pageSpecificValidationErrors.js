// NOTE:
// pageSpecificValidationErrors are required specifically to match the existing UX/UI.
// by having pageSpecificValidationErrors logic in the UI, we remain decoupled from the API.
// when the UX/UI is redesigned, we should only have to update the UI.
import errorHref from './errorHref';
import generateErrorSummary from './generateErrorSummary';
import {
  requiredFieldsArray,
  filterErrorList,
} from './pageFields';

export const allFieldsArray = (fields) => {
  const { OPTIONAL_FIELDS } = fields;
  const allFields = requiredFieldsArray(fields);

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

  const totalFieldValues = Object.keys(fieldValues).filter((fieldName) =>
    allFields.includes(fieldName) && fieldValues[fieldName].length > 0);

  if (totalFieldValues.length > 0 || fieldValues.viewedPreviewPage) {
    return true;
  }

  return false;
};

export const mapRequiredValidationErrors = (validationErrors, fields) => {
  const mappedErrors = validationErrors;
  const allRequiredFields = requiredFieldsArray(fields);

  mappedErrors.errorList = filterErrorList(validationErrors.errorList, allRequiredFields);

  return {
    ...generateErrorSummary(
      mappedErrors,
      errorHref,
    ),
    conditionalErrorList: mappedErrors.conditionalErrorList,
  };
};

export const pageSpecificValidationErrors = (validationErrors, fields, submittedFields) => {
  if (validationErrors && validationErrors.errorList) {
    if (shouldReturnRequiredValidation(fields, submittedFields)) {
      return mapRequiredValidationErrors(validationErrors, fields);
    }
  }

  return {
    conditionalErrorList: validationErrors.conditionalErrorList,
  };
};

export default pageSpecificValidationErrors;
