const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

const MAX_CHARACTERS = 30;

const isValidLength = (str) => str.length <= MAX_CHARACTERS;

const isValid = (str) => {
  if (!isValidLength(str)) {
    return false;
  }

  return true;
};

const validationText = (str, fieldTitle) => {
  if (!isValidLength(str)) {
    return `${fieldTitle} must be ${MAX_CHARACTERS} characters or fewer`;
  }
  return '';
};

module.exports = (loan, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(loan.bankReferenceNumber)) {
    newErrorList.bankReferenceNumber = {
      text: 'Enter the Bank reference number',
      order: orderNumber(newErrorList),
    };
  }

  if (hasValue(loan.bankReferenceNumber) && !isValid(loan.bankReferenceNumber)) {
    newErrorList.bankReferenceNumber = {
      text: validationText(
        loan.bankReferenceNumber,
        'Bank reference number',
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
