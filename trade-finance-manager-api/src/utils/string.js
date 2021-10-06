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

const stripCommas = (str) => str.replace(/,/g, '');

const capitalizeFirstLetter = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1);

const lowercaseFirstLetter = (str) =>
  str.charAt(0).toLowerCase() + str.slice(1);

module.exports = {
  isEmptyString,
  hasValue,
  stripCommas,
  capitalizeFirstLetter,
  lowercaseFirstLetter,
};
