const { hasValue } = require('../../../utils/string.util');
const {
  isNumeric,
  decimalsCount,
} = require('../../../utils/number.util');
const { orderNumber } = require('../../../utils/error-list-order-number.util');

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

const validationText = (str, fieldTitle) => {
  if (!hasValue(str)) {
    return `Enter the ${fieldTitle}`;
  }

  if (!isNumeric(Number(str))) {
    return `${fieldTitle} must be a number, like ${MIN_VALUE} or ${MAX_VALUE}`;
  }

  if (!isInRange(str)) {
    return `${fieldTitle} must be between ${MIN_VALUE} and ${MAX_VALUE}`;
  }

  if (!isValidFormat(str)) {
    return `${fieldTitle} must have less than ${MAX_DECIMALS + 1} decimals, like 12 or 12.3456`;
  }

  return `Enter the ${fieldTitle}`;
};

module.exports = (facility, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(facility.coveredPercentage)) {
    newErrorList.coveredPercentage = {
      text: validationText(
        facility.coveredPercentage,
        'Covered Percentage',
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
