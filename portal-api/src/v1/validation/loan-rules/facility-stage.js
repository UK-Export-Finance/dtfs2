const { hasValue } = require('../../../utils/string.util');
const { orderNumber } = require('../../../utils/error-list-order-number.util');

const isValid = (str) => {
  if (!hasValue(str)) {
    return false;
  }

  return true;
};

const validationText = (str, fieldTitle) => {
  if (!hasValue(str)) {
    return `Select the ${fieldTitle}`;
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
