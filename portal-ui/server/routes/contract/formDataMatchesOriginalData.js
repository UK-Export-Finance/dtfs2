const isEqual = require('lodash.isequal');

const isObjectWithChildValues = (field) => Boolean(Object.keys(field).length && Object.keys(field).length > 0);

const stripEmptyValues = (obj, originalData) => {
  const stripped = {};

  // only return fields that have a 'value':
  // - a non-empty string
  // - an object with children
  Object.entries(obj).forEach(([key, value]) => {
    if ((value && value.length) || originalData[key] === value || isObjectWithChildValues(value)) {
      stripped[key] = value;
    }
  });
  return stripped;
};

const getFieldsFromOriginalData = (formData, originalData) => {
  const fieldsWeWant = Object.getOwnPropertyNames(formData);
  const stripped = {};

  Object.keys(originalData).forEach((key) => {
    if (fieldsWeWant.includes(key)) {
      stripped[key] = originalData[key];
    }
  });

  return stripped;
};

const getFieldsWithEmptyValues = (obj) => {
  const result = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (!value || (value && !value.length)) {
      result[key] = value;
    }
  });

  return result;
};

const formDataMatchesOriginalData = (formData, originalData) => {
  // get the fields from original API data that we want to equality check
  const strippedOriginalData = getFieldsFromOriginalData(formData, originalData);

  // get the fields that are empty in API/original data
  const originalDataEmptyValues = getFieldsWithEmptyValues(strippedOriginalData);

  // remove empty fields from the submitted form data
  const cleanFormData = stripEmptyValues(formData, originalDataEmptyValues);

  // finally, equality check submitted form data against original data from API
  if (isEqual(strippedOriginalData, cleanFormData)) {
    return true;
  }
  return false;
};

module.exports = {
  formDataMatchesOriginalData,
  getFieldsWithEmptyValues,
  getFieldsFromOriginalData,
  stripEmptyValues,
  isObjectWithChildValues,
};
