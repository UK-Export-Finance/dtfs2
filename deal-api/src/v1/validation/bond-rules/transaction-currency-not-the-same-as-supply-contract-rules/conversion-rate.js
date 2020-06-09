const { hasValue } = require('../../../../utils/string');
const {
  isNumeric,
  decimalsCount,
} = require('../../../../utils/number');
const { orderNumber } = require('../../../../utils/error-list-order-number');

const MAX_CHARACTERS = 10;

const isValidLength = (str) => str.length <= 10;

const isValidFormat = (str) => {
  if (decimalsCount(str) > 6) {
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
