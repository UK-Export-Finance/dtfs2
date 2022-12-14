const isEmptyString = (str) => !str || ((typeof str === 'string' || str instanceof String) && !str.trim().length);

const hasValue = (str) => str && !isEmptyString(str);

const stripCommas = (str) => str.toString().replace(/,/g, '');

const capitalizeFirstLetter = (str) =>
  str.toString().charAt(0).toUpperCase() + str.slice(1);

const lowercaseFirstLetter = (str) =>
  str.toString().charAt(0).toLowerCase() + str.slice(1);

module.exports = {
  isEmptyString,
  hasValue,
  stripCommas,
  capitalizeFirstLetter,
  lowercaseFirstLetter,
};
