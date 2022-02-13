const { hasValue } = require('../../../utils/string.util');
const {
  isNumeric,
  decimalsCount,
  stripDecimals,
} = require('../../../utils/number.util');
const { orderNumber } = require('../../../utils/error-list-order-number.util');

const MIN_VALUE = 0;
const MAX_DECIMALS = 2;
const MAX_DIGITS = 14;

const isValidLength = (str) => String(stripDecimals(str)).length <= MAX_DIGITS;

const isInRange = (value) => value >= MIN_VALUE;

const isValidFormat = (value) => {
  if (decimalsCount(value) <= MAX_DECIMALS) {
    return true;
  }
  return false;
};

const isValid = (str) => {
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

const validationText = (str, fieldTitle) => {
  if (!isNumeric(Number(str))) {
    return `${fieldTitle} must be a number, like 1 or 12.65`;
  }

  if (!isValidLength(str)) {
    return `${fieldTitle} must be ${MAX_DIGITS} numbers or fewer`;
  }

  if (!isInRange(Number(str))) {
    return `${fieldTitle} must be ${MIN_VALUE} or more`;
  }

  if (!isValidFormat(str)) {
    return `${fieldTitle} must have less than ${MAX_DECIMALS + 1} decimals, like 1 or 12.10`;
  }
  return '';
};

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  if (hasValue(bond.minimumRiskMarginFee) && !isValid(bond.minimumRiskMarginFee)) {
    newErrorList.minimumRiskMarginFee = {
      text: validationText(
        bond.minimumRiskMarginFee,
        'Minimum risk margin fee',
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
