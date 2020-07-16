const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.role)) {
    newErrorList.role = {
      text: 'Enter What is your role?',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
