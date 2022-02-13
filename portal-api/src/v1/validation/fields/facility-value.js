const { hasValue } = require('../../../utils/string.util');
const {
  stripDecimals,
  decimalsCount,
  sanitizeCurrency,
} = require('../../../utils/number.util');
const { orderNumber } = require('../../../utils/error-list-order-number.util');

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

  const { isCurrency, sanitizedValue } = sanitizeCurrency(str);

  if (!isCurrency) {
    return false;
  }

  if (!isInRange(Number(sanitizedValue))) {
    return false;
  }

  if (!isValidLength(Number(sanitizedValue))) {
    return false;
  }

  if (!isValidFormat(Number(sanitizedValue))) {
    return false;
  }

  return true;
};

const validationText = (str, fieldTitle) => {
  if (!hasValue(str)) {
    return `Enter the ${fieldTitle}`;
  }

  const { isCurrency, sanitizedValue } = sanitizeCurrency(str);

  if (!isCurrency) {
    return `${fieldTitle} must be a currency format, like 1,345 or 1345.54`;
  }

  if (!isInRange(Number(sanitizedValue))) {
    return `${fieldTitle} must be ${MIN_VALUE} or more`;
  }

  if (!isValidLength(Number(sanitizedValue))) {
    return `${fieldTitle} must be ${MAX_DIGITS} numbers or fewer`;
  }

  if (!isValidFormat(Number(sanitizedValue))) {
    return `${fieldTitle} must have less than ${MAX_DECIMALS + 1} decimals, like 12 or 12.10`;
  }

  return '';
};

module.exports = (facility, fieldTitle, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(facility.value)) {
    newErrorList.value = {
      order: orderNumber(newErrorList),
      text: validationText(
        facility.value,
        fieldTitle,
      ),
    };
  }

  return newErrorList;
};
