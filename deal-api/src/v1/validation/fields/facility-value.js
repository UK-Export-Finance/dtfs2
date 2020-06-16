const { hasValue } = require('../../../utils/string');
const {
  isNumeric,
} = require('../../../utils/number');
const { orderNumber } = require('../../../utils/error-list-order-number');

const isValid = (str) => {
  if (!hasValue(str)) {
    return false;
  }

  if (!isNumeric(Number(str))) {
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
