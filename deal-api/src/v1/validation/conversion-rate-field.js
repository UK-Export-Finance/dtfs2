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

const isNumeric = (str) => {
  const value = Number(str);
  return (typeof value === 'number') && value === Number(value) && Number.isFinite(value);
};

const isWholeNumber = (value) => Number.isInteger(Number(value));

const isValidNumber = (str) => {
  if (str.length > 6 && isWholeNumber(Number(str))) {
    return false;
  }
  return true;
};

const isValidLength = (str) => str.length <= 10;

exports.conversionRateIsValid = (str) => {
  if (!str || !str.length) {
    return false;
  }
  if (!isNumeric(str)) {
    return false;
  }
  if (!isValidLength(str)) {
    return false;
  }
  if (!isValidNumber(str)) {
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
  if (!isNumeric(value)) {
    return `${fieldCopy} must be numbers only man`;
  }

  if (!isValidLength(value)) {
    return `${fieldCopy} length is not valid`;
  }

  if (!isValidNumber(value)) {
    return `${fieldCopy} length has invalid format`;
  }

  // return `Something else is invalid in ${fieldCopy}`;
  return `Enter the ${fieldCopy}`;
};
