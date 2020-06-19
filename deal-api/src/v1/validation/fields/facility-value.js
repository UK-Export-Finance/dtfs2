const { hasValue } = require('../../../utils/string');
const {
  isNumeric,
} = require('../../../utils/number');
const { orderNumber } = require('../../../utils/error-list-order-number');

const MIN_VALUE = 0.01;

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
