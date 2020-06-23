const { hasValue } = require('../../../utils/string');
const {
  isNumeric,
  stripDecimals,
  decimalsCount,
} = require('../../../utils/number');
const { orderNumber } = require('../../../utils/error-list-order-number');

const MIN_VALUE = 0.01;
const MAX_DECIMALS = 2;
const MAX_DIGITS = 14;

const isValidLength = (str) => String(stripDecimals(str)).length <= MAX_DIGITS;

const isValidFormat = (value) => {
  if (decimalsCount(value) <= MAX_DECIMALS) {
    return true;
  }
  return false;
};


const isInRange = (value) => value >= MIN_VALUE;

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

  if (!isValidLength(str)) {
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

  if (!isInRange(Number(str))) {
    return `${fieldTitle} must be ${MIN_VALUE} or more`;
  }

  if (!isValidLength(str)) {
    return `${fieldTitle} must be ${MAX_DIGITS} numbers or fewer`;
  }

  if (!isValidFormat(str)) {
    return `${fieldTitle} must have less than ${MAX_DECIMALS + 1} decimals, like 12 or 12.10`;
  }

  return '';
};

module.exports = (facility, fieldTitle, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(facility.facilityValue)) {
    newErrorList.facilityValue = {
      order: orderNumber(newErrorList),
      text: validationText(
        facility.facilityValue,
        fieldTitle,
      ),
    };
  }

  return newErrorList;
};
