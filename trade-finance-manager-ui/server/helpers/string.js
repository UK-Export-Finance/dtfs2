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
  const ALPHA_NUMBERIC_ONLY = new RegExp('^[A-Za-z0-9/\' .,-]+[A-Za-z0-9 .,-]+$');

  return ALPHA_NUMBERIC_ONLY.test(str);
};
