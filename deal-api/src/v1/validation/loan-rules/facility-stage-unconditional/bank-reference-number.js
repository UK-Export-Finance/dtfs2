const { hasValue } = require('../../../../utils/string');
const { orderNumber } = require('../../../../utils/error-list-order-number');

const MAX_CHARACTERS = 30;

const isValidLength = (str) => str.length <= MAX_CHARACTERS;

const isValid = (str) => {
  if (!hasValue(str)) {
    return false;
  }
  if (!isValidLength(str)) {
    return false;
  }

  return true;
};

const validationText = (str, fieldCopy) => {
  if (!hasValue(str)) {
    return `Enter the ${fieldCopy}`;
  }

  if (!isValidLength(str)) {
    return `${fieldCopy} must be ${MAX_CHARACTERS} characters or fewer`;
  }
  return '';
};

module.exports = (loan, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(loan.bankReferenceNumber)) {
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
