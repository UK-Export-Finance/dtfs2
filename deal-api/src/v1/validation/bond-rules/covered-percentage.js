const { hasValue } = require('../../../utils/string');
const {
  isNumeric,
} = require('../../../utils/number');
const { orderNumber } = require('../../../utils/error-list-order-number');

const MIN_VALUE = 1;
const MAX_VALUE = 80;

const isInRange = (value) => value >= MIN_VALUE && value <= MAX_VALUE;

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

  return true;
};

const validationText = (str, fieldCopy) => {
  if (!isNumeric(Number(str))) {
    return `${fieldCopy} must be a number, like ${MIN_VALUE} or ${MAX_VALUE}`;
  }

  if (!isInRange(str)) {
    return `${fieldCopy} must be between ${MIN_VALUE} and ${MAX_VALUE}`;
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
