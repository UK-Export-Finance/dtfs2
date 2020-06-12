const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

const isValid = (str) => {
  if (!hasValue(str)) {
    return false;
  }

  return true;
};

const validationText = (str, fieldCopy) => {
  if (!hasValue(str)) {
    return `Select the ${fieldCopy}`;
  }
  return '';
};

module.exports = (loan, errorList) => {
  const newErrorList = { ...errorList };

  if (!isValid(loan.facilityStage)) {
    newErrorList.facilityStage = {
      text: validationText(
        loan.facilityStage,
        'Facility stage',
      ),
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
