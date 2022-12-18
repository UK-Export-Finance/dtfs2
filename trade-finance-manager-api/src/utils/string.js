const isEmptyString = (s) => !s || ((typeof s === 'string' || s instanceof String) && !s.trim().length);

const hasValue = (s) => Boolean(s) && !isEmptyString(s);

const stripCommas = (s) => (hasValue(s) ? s.toString().replace(/,/g, '') : s);

const capitalizeFirstLetter = (s) => (hasValue(s) ? s.toString().charAt(0).toUpperCase() + s.toString().slice(1) : s);

const lowercaseFirstLetter = (s) => (hasValue(s) ? s.toString().charAt(0).toLowerCase() + s.toString().slice(1) : s);

module.exports = {
  isEmptyString,
  hasValue,
  stripCommas,
  capitalizeFirstLetter,
  lowercaseFirstLetter,
};
