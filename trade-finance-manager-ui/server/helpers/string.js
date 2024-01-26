/**
 * @param {unknown} value
 * @returns {boolean}
 */
export const isString = (value) => typeof value === 'string' || value instanceof String;

const isEmptyString = (str) => {
  if (!str || (isString(str) && !str.trim().length)) {
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
  isString,
  isEmptyString,
  hasValue,
  containsNumber,
};
