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

const validationText = (str, fieldCopy) => {
  if (!hasValue(str)) {
    return `Enter the ${fieldCopy}`;
  }

  if (!isNumeric(Number(str))) {
    return `${fieldCopy} must be a number, like 1 or 12.65`;
  }

  return '';
};

module.exports = (loan, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(loan.facilityValue)) {
    newErrorList.facilityValue = {
      order: orderNumber(newErrorList),
      text: validationText(
        loan.facilityValue,
        'Loan facility value',
      ),
    };
  }

  return newErrorList;
};
