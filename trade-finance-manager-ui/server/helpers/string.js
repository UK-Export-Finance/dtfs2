const { isString } = require('@ukef/dtfs2-common');

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
  isEmptyString,
  hasValue,
  containsNumber,
};
