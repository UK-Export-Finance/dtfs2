const {
  isNumeric,
} = require('../../../utils/number');

const isInRange = (value) => value >= 1 && value <= 80;

exports.coveredPercentageIsValid = (str) => {
  if (!str || !str.length) {
    return false;
  }

  if (!isNumeric(Number(str))) {
    return false;
  }

  if (!isInRange(Number(str))) {
    return false;
  }

  return true;
};

exports.coveredPercentageValidationText = (str, fieldCopy) => {
  if (!isNumeric(Number(str))) {
    return `${fieldCopy} must be a number, like 1 or 80`;
  }

  if (!isInRange(str)) {
    return `${fieldCopy} must be between 1 and 80`;
  }

  return `Enter the ${fieldCopy}`;
};
