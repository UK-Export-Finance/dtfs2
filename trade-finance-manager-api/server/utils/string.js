const { isString } = require('@ukef/dtfs2-common');

const isEmptyString = (str) => !str || (isString(str) && !str.trim().length);

const hasValue = (str) => Boolean(str) && !isEmptyString(str);

const stripCommas = (str) => (hasValue(str) ? str.toString().replace(/,/g, '') : str);

const capitalizeFirstLetter = (str) => (hasValue(str) ? str.toString().charAt(0).toUpperCase() + str.toString().slice(1) : str);

const lowercaseFirstLetter = (str) => (hasValue(str) ? str.toString().charAt(0).toLowerCase() + str.toString().slice(1) : str);

module.exports = {
  isEmptyString,
  hasValue,
  stripCommas,
  capitalizeFirstLetter,
  lowercaseFirstLetter,
};
