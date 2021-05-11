export const isEmptyString = (str) => {
  if (!str || ((typeof str === 'string' || str instanceof String) && !str.trim().length)) {
    return true;
  }
  return false;
};

export const hasValue = (str) => {
  if (str && !isEmptyString(str)) {
    return true;
  }
  return false;
};

export const containsNumber = (str) =>
  /\d/.test(str);

export const isAlphanumeric = (str) => {
  // allowed characters:
  // A-Z
  // 0-9
  // commas
  // full stops
  // apostrophes
  // white/empty space
  // hyphens
  const ALPHA_NUMBERIC_ONLY = new RegExp('^[A-Za-z0-9/\' s+.,-]+[A-Za-z0-9 s+.,-]+$', 'g');

  // ensure new lines are removed (new lines inputted by html textarea)
  const arr = str.split(/[\n\r]/g);

  return ALPHA_NUMBERIC_ONLY.test(arr);
};
