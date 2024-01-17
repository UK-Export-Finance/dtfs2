const isEmptyString = (str) => {
  if (!str || ((typeof str === 'string' || str instanceof String) && !str.trim().length)) {
    return true;
  }
  return false;
};

const hasValue = (str) => {
  if (str && !isEmptyString(str)) {
    return true;
  }
  return false;
};

const containsNumber = (str) => /\d/.test(str);

module.exports = {
  isEmptyString,
  hasValue,
  containsNumber,
};
