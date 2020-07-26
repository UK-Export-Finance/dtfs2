import isEqual from 'lodash.isequal';

export const stripEmptyValuesFromObject = (obj, originalData) => {
  const stripped = {};

  Object.entries(obj).forEach(([key, value]) => {
    if ((value && value.length)
      || originalData[key] === value) {
      stripped[key] = value;
    }
  });
  return stripped;
};

export const getFieldsFromOriginalData = (formData, originalData) => {
  const fieldsWeWant = Object.getOwnPropertyNames(formData);
  const stripped = {};

  Object.keys(originalData).forEach((key) => {
    if (fieldsWeWant.includes(key)) {
      stripped[key] = originalData[key];
    }
  });

  return stripped;
};

export const getFieldsWithEmptyValues = (obj) => {
  const result = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (!value || (value && !value.length)) {
      // || obj[key] === value) {
      result[key] = value;
    }
  });

  return result;
};

const formDataMatchesOriginalData = (formData, originalData) => {
  // get the fields we care about from original/api data
  const strippedOriginalData = getFieldsFromOriginalData(formData, originalData);

  // we only want empty form values that are also already empty in the API
  const originalDataEmptyValues = getFieldsWithEmptyValues(strippedOriginalData);
  const cleanFormData = stripEmptyValuesFromObject(formData, originalDataEmptyValues);

  console.log('----------- strippedOriginalData \n', strippedOriginalData);
  console.log('----------- cleanFormData \n', cleanFormData);

  if (isEqual(strippedOriginalData, cleanFormData)) {
    return true;
  }
  return false;
};

export default formDataMatchesOriginalData;
