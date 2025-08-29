// NOTE:
// pageSpecificValidationErrors are required specifically to match the existing UX/UI. This being:
// - only show validation errors if
// - - the entities 'Check your answers' page (AKA 'Preview' page) has been viewed
// - - one of entities forms has had a value submitted
// by having pageSpecificValidationErrors logic in the UI, we remain decoupled = require(the API).
const cloneDeep = require('lodash/cloneDeep');
const errorHref = require('./errorHref');
const generateErrorSummary = require('./generateErrorSummary');
const { requiredFieldsArray, filterErrorList } = require('./pageFields');

const allFieldsArray = (fields) => {
  const { OPTIONAL_FIELDS } = fields;
  const allFields = requiredFieldsArray(fields);

  if (OPTIONAL_FIELDS) {
    allFields.push(...OPTIONAL_FIELDS);
  }

  return allFields;
};

const shouldReturnRequiredValidation = (fields, fieldValues) => {
  // Guard clause: if fieldValues is null or undefined, return false
  if (!fieldValues) {
    return false;
  }

  const allFields = allFieldsArray(fields);

  if (fieldValues.viewedPreviewPage) {
    return true;
  }
  const totalFieldValues = Object.keys(fieldValues).filter((fieldName) => allFields.includes(fieldName));
  if (totalFieldValues.length > 0) {
    return true;
  }

  return false;
};

const mapRequiredValidationErrors = (validationErrors, fields) => {
  const mappedErrors = validationErrors;
  const allRequiredFields = requiredFieldsArray(fields);

  mappedErrors.errorList = filterErrorList(validationErrors.errorList, allRequiredFields);

  return {
    ...generateErrorSummary(mappedErrors, errorHref),
  };
};

/*
 ALWAYS_SHOW_ERROR_FIELDS are fields that are:
 - not required (therefore optional)
 - BUT if this field has an error, always show it after form submit.
 - this is the opposite of 'page specific validation rules'
 - this is currently only used for Companies House validation.
*/
const hasSubmittedAlwaysShowErrorFields = (allFields, submittedFields) => {
  const { ALWAYS_SHOW_ERROR_FIELDS } = allFields;

  const hasAlwaysShowFields = ALWAYS_SHOW_ERROR_FIELDS && ALWAYS_SHOW_ERROR_FIELDS.length > 0;

  if (hasAlwaysShowFields) {
    const pageFields = Object.keys(submittedFields).filter((fieldName) => ALWAYS_SHOW_ERROR_FIELDS.includes(fieldName));

    if (pageFields.length > 0) {
      return true;
    }
  }

  return false;
};

const mapAlwaysShowErrorFields = (validationErrors, fields) => {
  const mappedErrors = { ...validationErrors };

  const filteredErrorList = filterErrorList(validationErrors.errorList, fields.ALWAYS_SHOW_ERROR_FIELDS);

  return {
    ...generateErrorSummary({ ...mappedErrors, errorList: filteredErrorList }, errorHref),
  };
};

const mapRequiredAndAlwaysShowErrorFields = (validationErrors, allFields) => {
  const mappedErrors = cloneDeep(validationErrors);
  const allRequiredFields = requiredFieldsArray(allFields);
  const alwaysShowErrorFields = allFields.ALWAYS_SHOW_ERROR_FIELDS ? allFields.ALWAYS_SHOW_ERROR_FIELDS : [];

  const fieldsToReturn = [...allRequiredFields, ...alwaysShowErrorFields];

  mappedErrors.errorList = filterErrorList(validationErrors.errorList, fieldsToReturn);

  return {
    ...generateErrorSummary(mappedErrors, errorHref),
  };
};

const pageSpecificValidationErrors = (validationErrors, fields, submittedFields) => {
  if (validationErrors && validationErrors.errorList) {
    if (!submittedFields.viewedPreviewPage && hasSubmittedAlwaysShowErrorFields(fields, submittedFields)) {
      if (submittedFields.status === 'Incomplete') {
        return mapRequiredAndAlwaysShowErrorFields(validationErrors, fields);
      }
      return mapAlwaysShowErrorFields(validationErrors, fields);
    }

    if (shouldReturnRequiredValidation(fields, submittedFields)) {
      if (hasSubmittedAlwaysShowErrorFields(fields, submittedFields)) {
        return mapRequiredAndAlwaysShowErrorFields(validationErrors, fields);
      }
      return mapRequiredValidationErrors(validationErrors, fields);
    }
  }

  return {};
};

module.exports = {
  allFieldsArray,
  shouldReturnRequiredValidation,
  mapAlwaysShowErrorFields,
  mapRequiredAndAlwaysShowErrorFields,
  mapRequiredValidationErrors,
  hasSubmittedAlwaysShowErrorFields,
  pageSpecificValidationErrors,
};
