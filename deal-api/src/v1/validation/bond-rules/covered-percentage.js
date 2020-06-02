const {
  isNumeric,
} = require('../../../utils/number');

const MIN_VALUE = 1;
const MAX_VALUE = 80;

const isInRange = (value) => value >= MIN_VALUE && value <= MAX_VALUE;

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
    return `${fieldCopy} must be a number, like ${MIN_VALUE} or ${MAX_VALUE}`;
  }

  if (!isInRange(str)) {
    return `${fieldCopy} must be between ${MIN_VALUE} and ${MAX_VALUE}`;
  }

  return `Enter the ${fieldCopy}`;
};
