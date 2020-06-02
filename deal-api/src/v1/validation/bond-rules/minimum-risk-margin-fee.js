const {
  isNumeric,
  decimalsCount,
} = require('../../../utils/number');

const MAX_DECIMALS = 2;
const MAX_CHARACTERS = 16;
const MIN_VALUE = 0.01;
const MAX_VALUE = 14.99;

const isValidLength = (str) => str.length <= MAX_CHARACTERS;

const isInRange = (value) => value >= MIN_VALUE && value <= MAX_VALUE;

const isValidFormat = (value) => {
  if (decimalsCount(value) <= MAX_DECIMALS) {
    return true;
  }
  return false;
};

exports.minimumRiskMarginFeeIsValid = (str) => {
  if (!isNumeric(Number(str))) {
    return false;
  }

  if (!isValidLength(str)) {
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

exports.minimumRiskMarginFeeValidationText = (str, fieldCopy) => {
  if (!isNumeric(Number(str))) {
    return `${fieldCopy} must be a number, like 1 or 12.65`;
  }

  if (!isValidLength(str)) {
    return `${fieldCopy} must be ${MAX_CHARACTERS} characters or fewer`;
  }

  if (!isInRange(Number(str))) {
    return `${fieldCopy} must be between ${MIN_VALUE} and ${MAX_VALUE}`;
  }

  if (!isValidFormat(str)) {
    return `${fieldCopy} must have less than ${MAX_DECIMALS + 1} decimals, like 12 or 12.10`;
  }
  return null;
};
