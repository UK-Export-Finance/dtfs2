const removeEmptyStringsFromObject = (obj) => {
  const valuesObj = obj;

  Object.entries(valuesObj).forEach(([key, value]) => {

    if ((typeof value === 'string' || value instanceof String) && !value.length) {
      delete valuesObj[key];
    }
  });

  return valuesObj;
};

export default removeEmptyStringsFromObject;
