const {
  isNumeric,
  decimalsCount,
} = require('../../../utils/number');

const MAX_DECIMALS = 4;

const isInRange = (value) => value >= 1 && value <= 99;

const isValidFormat = (value) => {
  if (decimalsCount(value) <= MAX_DECIMALS) {
    return true;
  }
  return false;
};

exports.riskMarginFeeIsValid = (str) => {
  if (!str || !str.length) {
    return false;
  }

  if (!isNumeric(Number(str))) {
    return false;
  }

  if (!isInRange(Number(str))) {
    return false;
  }

  if (!isValidFormat(Number(str))) {
    return false;
  }

  return true;
};

exports.riskMarginFeeValidationText = (str, fieldCopy) => {
  if (!isNumeric(Number(str))) {
    return `${fieldCopy} must be a number, like 1 or 12.65`;
  }

  if (!isInRange(str)) {
    return `${fieldCopy} must be between 1 and 99`;
  }

  if (!isValidFormat(str)) {
    return `${fieldCopy} must have less than ${MAX_DECIMALS + 1} decimals, like 12 or 12.0010`;
  }

  return `Enter the ${fieldCopy}`;
};
