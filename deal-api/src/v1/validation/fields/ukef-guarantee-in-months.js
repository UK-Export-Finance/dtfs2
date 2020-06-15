const { hasValue } = require('../../../utils/string');
const {
  isNumeric,
  decimalsCount,
} = require('../../../utils/number');
const { orderNumber } = require('../../../utils/error-list-order-number');

const isInRange = (value) => value >= 0 && value <= 999;

const isValidFormat = (value) => {
  if (decimalsCount(value) === 0) {
    return true;
  }
  return false;
};

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
    return `${fieldCopy} must be a number, like 1 or 12`;
  }

  if (!isInRange(Number(str))) {
    return `${fieldCopy} must be between 0 and 999`;
  }

  if (!isValidFormat(str)) {
    return `${fieldCopy} must be a whole number, like 12`;
  }
  return '';
};

module.exports = (loan, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(loan.ukefGuaranteeInMonths)) {
    newErrorList.ukefGuaranteeInMonths = {
      text: validationText(
        loan.ukefGuaranteeInMonths,
        'Length of time that the UKEF\'s guarantee will be in place for',
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
