const {
  isNumeric,
  isInteger,
} = require('../../../utils/number');

// invalid values:
// 1234567
// 123456789
// 123456 USD

// valid values:
// 1
// 12
// 123
// 1234
// 123456
// 123.4
// 123.456
// 123.456789
// 1.234567

const MAX_CHARACTERS = 10;

const isValidLength = (str) => str.length <= 10;

const isValidFormat = (str) => {
  if (str.length > 6 && isInteger(Number(str))) {
    return false;
  }
  return true;
};

exports.conversionRateIsValid = (str) => {
  if (!str || !str.length) {
    return false;
  }
  if (!isNumeric(Number(str))) {
    return false;
  }
  if (!isValidLength(str)) {
    return false;
  }
  if (!isValidFormat(str)) {
    return false;
  }
  return true;
};

exports.conversionRateValidationText = (value, fieldCopy) => {
  if (!isNumeric(Number(value))) {
    return `${fieldCopy} must be a number, like 100 or 100.4`;
  }

  if (!isValidLength(value)) {
    return `${fieldCopy} must be ${MAX_CHARACTERS} characters or fewer`;
  }

  if (!isValidFormat(value)) {
    return `${fieldCopy} must be up to 6 digits, including up to 6 decimal places`;
  }

  return `Enter the ${fieldCopy}`;
};
