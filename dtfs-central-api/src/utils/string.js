const isEmptyString = (str) => !str || ((typeof str === 'string' || str instanceof String) && !str.trim().length);

const hasValue = (str) => {
  if (str && !isEmptyString(str)) {
    return true;
  }
  return false;
};
module.exports = {
  isEmptyString,
  hasValue,
};
