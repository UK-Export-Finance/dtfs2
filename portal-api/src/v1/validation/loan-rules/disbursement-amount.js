const { hasValue } = require('../../../utils/string.util');
const {
  isNumeric,
  decimalsCount,
  sanitizeCurrency,
} = require('../../../utils/number.util');
const { orderNumber } = require('../../../utils/error-list-order-number.util');

const MIN_VALUE = 0.01;
const MAX_DECIMALS = 2;

const isGreaterThanMinValue = (disbursementAmount) => disbursementAmount >= MIN_VALUE;

const isLessThanFacilityValue = (disbursementAmount, value) => disbursementAmount <= value;

const isValidFormat = (value) => {
  if (decimalsCount(value) <= MAX_DECIMALS) {
    return true;
  }
  return false;
};

const isValid = (disbursementAmount, value) => {
  if (!hasValue(disbursementAmount)) {
    return false;
  }

  const sanitizedFacilityValue = sanitizeCurrency(value);
  const { sanitizedValue } = sanitizeCurrency(disbursementAmount);

  if (!isNumeric(Number(sanitizedValue))) {
    return false;
  }

  if (!isGreaterThanMinValue(Number(sanitizedValue))) {
    return false;
  }

  if (!isValidFormat(Number(sanitizedValue))) {
    return false;
  }

  if (hasValue(value)
      && !isLessThanFacilityValue(Number(sanitizedValue), Number(sanitizedFacilityValue.sanitizedValue))
  ) {
    return false;
  }

  return true;
};

const canValidateAgainstFacilityValue = (disbursementAmount, value) => {
  if (hasValue(disbursementAmount)
    && isNumeric(Number(disbursementAmount))
    && isGreaterThanMinValue(Number(disbursementAmount))
    && isValidFormat(Number(disbursementAmount))
    && hasValue(value)) {
    return true;
  }
  return false;
};

const validationText = (disbursementAmount, value, fieldTitle) => {
  if (!hasValue(disbursementAmount)) {
    return `Enter the ${fieldTitle}`;
  }

  const sanitizedFacilityValue = sanitizeCurrency(value);
  const { isCurrency, sanitizedValue } = sanitizeCurrency(disbursementAmount);

  if (!isCurrency) {
    return `${fieldTitle} must be a currency format, like 1,345 or 1345.54`;
  }

  if (!isGreaterThanMinValue(Number(sanitizedValue))) {
    return `${fieldTitle} must be more than ${MIN_VALUE}`;
  }

  if (!isValidFormat(Number(sanitizedValue))) {
    return `${fieldTitle} must have less than ${MAX_DECIMALS + 1} decimals, like 12 or 12.65`;
  }

  if (canValidateAgainstFacilityValue(sanitizedValue, sanitizedFacilityValue.sanitizedValue)) {
    if (!isLessThanFacilityValue(Number(sanitizedValue), Number(sanitizedFacilityValue.sanitizedValue))) {
      return `${fieldTitle} must be less than the Loan facility value (${value})`;
    }
  }

  return '';
};

module.exports = (loan, errorList) => {
  const newErrorList = { ...errorList };
  const {
    value,
    disbursementAmount,
  } = loan;

  if (!isValid(disbursementAmount, value)) {
    newErrorList.disbursementAmount = {
      text: validationText(
        disbursementAmount,
        value,
        'Disbursement amount',
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
