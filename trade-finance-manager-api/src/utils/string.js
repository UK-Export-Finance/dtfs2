/**
 * @param {unknown} value
 * @returns {boolean}
 */
const isString = (value) => typeof value === 'string' || value instanceof String;

const isEmptyString = (s) => !s || (isString(s) && !s.trim().length);

const hasValue = (s) => Boolean(s) && !isEmptyString(s);

const stripCommas = (s) => (hasValue(s) ? s.toString().replace(/,/g, '') : s);

const capitalizeFirstLetter = (s) => (hasValue(s) ? s.toString().charAt(0).toUpperCase() + s.toString().slice(1) : s);

const lowercaseFirstLetter = (s) => (hasValue(s) ? s.toString().charAt(0).toLowerCase() + s.toString().slice(1) : s);

module.exports = {
  isString,
  isEmptyString,
  hasValue,
  stripCommas,
  capitalizeFirstLetter,
  lowercaseFirstLetter,
};
