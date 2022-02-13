const { hasValue } = require('../../../utils/string.util');
const {
  isNumeric,
  decimalsCount,
} = require('../../../utils/number.util');
const { orderNumber } = require('../../../utils/error-list-order-number.util');

const MAX_DECIMALS = 4;

const isInRange = (value) => value >= 0 && value <= 99;

const isValidFormat = (value) => {
  if (decimalsCount(value) <= MAX_DECIMALS) {
    return true;
  }
  return false;
};

const isValid = (str) => {
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

const validationText = (str, fieldTitle) => {
  if (!hasValue(str)) {
    return `Enter the ${fieldTitle}`;
  }

  if (!isNumeric(Number(str))) {
    return `${fieldTitle} must be a number, like 1 or 12.65`;
  }

  if (!isInRange(str)) {
    return `${fieldTitle} must be between 0 and 99`;
  }

  if (!isValidFormat(str)) {
    return `${fieldTitle} must have less than ${MAX_DECIMALS + 1} decimals, like 12 or 12.0010`;
  }

  return `Enter the ${fieldTitle}`;
};

module.exports = (entity, fieldName, fieldTitle, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(entity[fieldName])) {
    newErrorList[fieldName] = {
      text: validationText(
        entity[fieldName],
        fieldTitle,
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
