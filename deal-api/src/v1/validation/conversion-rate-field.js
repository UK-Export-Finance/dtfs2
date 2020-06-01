const {
  isNumeric,
  isInteger,
} = require('../../utils/number');

// invalid value:
// 1234567
// 123456789
// 123456 USD

// valid value:
// 1
// 12
// 123
// 1234
// 123456
// 123.4
// 123.456
// 123.456789
// 1.234567

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

// TODO: check messages
// https://design-system.service.gov.uk/components/text-input/

// current message on staging can be:
// "The format of Conversion rate to the Supply Contract currency is invalid.
// ...This number can have up to 6 digits, including up to 6 decimal places"
exports.conversionRateValidationText = (value, fieldCopy) => {
  if (!isNumeric(Number(value))) {
    return `${fieldCopy} must be numbers only man`;
  }

  if (!isValidLength(value)) {
    return `${fieldCopy} length is not valid`;
  }

  if (!isValidFormat(value)) {
    return `${fieldCopy} length has invalid format`;
  }

  return `Enter the ${fieldCopy}`;
};
