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

const containsNumber = (str) =>
  /\d/.test(str);

const isAlphanumeric = (str) => {
  // allowed characters:
  // A-Z
  // 0-9
  // commas
  // full stops
  // apostrophes
  // white/empty space
  // hyphens
  // eslint-disable-next-line prefer-regex-literals
  const ALPHA_NUMERIC_ONLY = new RegExp('^[A-Za-z0-9/\' s+.,-]+[A-Za-z0-9 s+.,-]+$', 'g');

  // ensure new lines are removed (new lines inputted by html textarea)
  const arr = str.split(/[\n\r]/g);

  return ALPHA_NUMERIC_ONLY.test(arr);
};

module.exports = {
  isEmptyString,
  hasValue,
  containsNumber,
  isAlphanumeric,
};
