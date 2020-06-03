const { hasValue } = require('../../../../utils/string');
const {
  isNumeric,
  isInteger,
} = require('../../../../utils/number');
const { orderNumber } = require('../../../../utils/error-list-order-number');

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

const isValid = (str) => {
  if (!hasValue(str)) {
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

const validationText = (value, fieldCopy) => {
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

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(bond.conversionRate)) {
    newErrorList.conversionRate = {
      text: validationText(
        bond.conversionRate,
        'Conversion rate to the Supply Contract currency',
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
