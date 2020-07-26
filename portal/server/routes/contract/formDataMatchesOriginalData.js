import isEqual from 'lodash.isequal';

export const stripEmptyValuesFromObject = (obj, originalData) => {
  const stripped = {};

  const objectArray = Object.entries(obj);

  objectArray.forEach(([key, value]) => {
    if ((value && value.length)
        || originalData[key] === value) {
      stripped[key] = value;
    }
  });

  return stripped;
};

const formDataMatchesOriginalData = (formData, originalData) => {
  const strippedFormData = stripEmptyValuesFromObject(formData, originalData);

  const formDataWithOriginalData = {
    ...originalData,
    ...strippedFormData,
  };

  if (isEqual(originalData, formDataWithOriginalData)) {
    return true;
  }
  return false;
};

export default formDataMatchesOriginalData;
