const hasValue = (value) =>
  value && value.length;

const isNumber = (value) => {
  if (typeof value === 'number') {
    return true;
  }

  return false;
};

const hasBooleanValue = (value) => {
  if (value === true
    || value === false) {
    return true;
  }

  return false;
};

const hasObjectValues = (obj) => {
  if (Object.keys(obj).length) {
    return true;
  }

  return false;
};

module.exports = {
  hasValue,
  isNumber,
  hasBooleanValue,
  hasObjectValues,
};
