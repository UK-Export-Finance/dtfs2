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

const stripCommas = (str) => str.replace(',', '');

module.exports = {
  isEmptyString,
  hasValue,
  stripCommas,
};
