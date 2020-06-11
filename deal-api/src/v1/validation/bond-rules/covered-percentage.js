const { hasValue } = require('../../../utils/string');
const {
  isNumeric,
  decimalsCount,
} = require('../../../utils/number');
const { orderNumber } = require('../../../utils/error-list-order-number');

const MIN_VALUE = 1;
const MAX_VALUE = 80;
const MAX_DECIMALS = 4;

const isInRange = (value) => value >= MIN_VALUE && value <= MAX_VALUE;

const isValidFormat = (value) => {
  if (decimalsCount(value) <= MAX_DECIMALS) {
    return true;
  }
  return false;
};

const isValid = (str) => {
  if (!hasValue(str)) {
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

const validationText = (str, fieldCopy) => {
  if (!hasValue(str)) {
    return `Enter the ${fieldCopy}`;
  }

  if (!isNumeric(Number(str))) {
    return `${fieldCopy} must be a number, like ${MIN_VALUE} or ${MAX_VALUE}`;
  }

  if (!isInRange(str)) {
    return `${fieldCopy} must be between ${MIN_VALUE} and ${MAX_VALUE}`;
  }

  if (!isValidFormat(str)) {
    return `${fieldCopy} must have less than ${MAX_DECIMALS + 1} decimals, like 12 or 12.3456`;
  }

  return `Enter the ${fieldCopy}`;
};

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(bond.coveredPercentage)) {
    newErrorList.coveredPercentage = {
      text: validationText(
        bond.coveredPercentage,
        'Covered Percentage',
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
