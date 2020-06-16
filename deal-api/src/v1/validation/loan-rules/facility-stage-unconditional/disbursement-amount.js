const { hasValue } = require('../../../../utils/string');
const {
  isNumeric,
  decimalsCount,
} = require('../../../../utils/number');
const { orderNumber } = require('../../../../utils/error-list-order-number');

const MIN_VALUE = 1;
const MAX_DECIMALS = 2;

const isGreaterThanMinValue = (disbursementAmount) => disbursementAmount >= MIN_VALUE;

const isLessThanFacilityValue = (disbursementAmount, facilityValue) => disbursementAmount <= facilityValue;

const isValidFormat = (value) => {
  if (decimalsCount(value) <= MAX_DECIMALS) {
    return true;
  }
  return false;
};

const isValid = (disbursementAmount, facilityValue) => {
  if (!hasValue(disbursementAmount)) {
    return false;
  }

  if (!isNumeric(Number(disbursementAmount))) {
    return false;
  }

  if (!isGreaterThanMinValue(Number(disbursementAmount))) {
    return false;
  }

  if (!isValidFormat(Number(disbursementAmount))) {
    return false;
  }

  if (hasValue(facilityValue) && !isLessThanFacilityValue(Number(disbursementAmount), Number(facilityValue))) {
    return false;
  }

  return true;
};

const canValidateAgainstFacilityValue = (disbursementAmount, facilityValue) => {
  if (hasValue(disbursementAmount)
    && isNumeric(Number(disbursementAmount))
    && isGreaterThanMinValue(Number(disbursementAmount))
    && isValidFormat(Number(disbursementAmount))
    && hasValue(facilityValue)) {
    return true;
  }
  return false;
};

const validationText = (disbursementAmount, facilityValue, fieldTitle) => {
  if (!hasValue(disbursementAmount)) {
    return `Enter the ${fieldTitle}`;
  }

  if (!isNumeric(Number(disbursementAmount))) {
    return `${fieldTitle} must be a number, like 1 or 12.65`;
  }

  if (!isGreaterThanMinValue(Number(disbursementAmount))) {
    return `${fieldTitle} must be more than ${MIN_VALUE}`;
  }

  if (!isValidFormat(disbursementAmount)) {
    return `${fieldTitle} must have less than ${MAX_DECIMALS + 1} decimals, like 12 or 12.65`;
  }

  if (canValidateAgainstFacilityValue(disbursementAmount, facilityValue)) {
    if (!isLessThanFacilityValue(Number(disbursementAmount), Number(facilityValue))) {
      return `${fieldTitle} must be less than the Loan facility value (${facilityValue})`;
    }
  }

  return '';
};

module.exports = (loan, errorList) => {
  const newErrorList = { ...errorList };
  const {
    facilityValue,
    disbursementAmount,
  } = loan;

  if (!isValid(disbursementAmount, facilityValue)) {
    newErrorList.disbursementAmount = {
      text: validationText(
        disbursementAmount,
        facilityValue,
        'Disbursement amount',
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
