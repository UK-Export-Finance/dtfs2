import isEqual from 'lodash.isequal';

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

const formDataMatchesOriginalData = (formData, originalData) => {
  const strippedOriginalData = getFieldsFromOriginalData(formData, originalData);

  if (isEqual(strippedOriginalData, formData)) {
    return true;
  }
  return false;
};

export default formDataMatchesOriginalData;
