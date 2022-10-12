const isEmptyString = (str) => !str || ((typeof str === 'string' || str instanceof String) && !str.trim().length);

const hasValue = (str) => str && !isEmptyString(str);

module.exports = {
  isEmptyString,
  hasValue,
};
