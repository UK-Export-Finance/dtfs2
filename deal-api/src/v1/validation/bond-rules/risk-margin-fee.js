const { hasValue } = require('../../../utils/string');
const {
  isNumeric,
  decimalsCount,
} = require('../../../utils/number');
const { orderNumber } = require('../../../utils/error-list-order-number');

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

const validationText = (str, fieldCopy) => {
  if (!hasValue(str)) {
    return `Enter the ${fieldCopy}`;
  }

  if (!isNumeric(Number(str))) {
    return `${fieldCopy} must be a number, like 1 or 12.65`;
  }

  if (!isInRange(str)) {
    return `${fieldCopy} must be between 0 and 99`;
  }

  if (!isValidFormat(str)) {
    return `${fieldCopy} must have less than ${MAX_DECIMALS + 1} decimals, like 12 or 12.0010`;
  }

  return `Enter the ${fieldCopy}`;
};

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(bond.riskMarginFee)) {
    newErrorList.riskMarginFee = {
      text: validationText(
        bond.riskMarginFee,
        'Risk Margin Fee %',
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
