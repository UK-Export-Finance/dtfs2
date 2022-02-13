const { hasValue } = require('../../../../utils/string.util');
const {
  isNumeric,
  isInteger,
  decimalsCount,
} = require('../../../../utils/number.util');
const { orderNumber } = require('../../../../utils/error-list-order-number.util');

const MAX_CHARACTERS = 12;

const isValidLength = (str) => str.length <= MAX_CHARACTERS + 1; // add 1 for decimal point

const isValidFormat = (str) => {
  const invalidInteger = (str.length > 6 && isInteger(Number(str)));
  const invalidDecimals = decimalsCount(str) > 6;
  const validFormat = (!invalidInteger && !invalidDecimals);

  if (!validFormat) {
    return false;
  }
  return true;
};

const isValid = (str) => {
  if (!hasValue(str)) {
    return false;
  }
  if (!isNumeric(Number(str))) {
    return false;
  }
  if (!isValidLength(str)) {
    return false;
  }
  if (!isValidFormat(str)) {
    return false;
  }
  return true;
};

const validationText = (value, fieldTitle) => {
  if (!isNumeric(Number(value))) {
    return `${fieldTitle} must be a number, like 100 or 100.4`;
  }

  if (!isValidLength(value)) {
    return `${fieldTitle} must be ${MAX_CHARACTERS} numbers or fewer. You can include up to 6 decimal places as part of your number.`;
  }

  if (!isValidFormat(value)) {
    return `${fieldTitle} can only include up to 6 decimal places`;
  }

  return `Enter the ${fieldTitle}`;
};

module.exports = (facility, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(facility.conversionRate)) {
    newErrorList.conversionRate = {
      text: validationText(
        facility.conversionRate,
        'Conversion rate',
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
