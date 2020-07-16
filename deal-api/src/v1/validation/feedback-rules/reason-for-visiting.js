const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.reasonForVisiting)) {
    newErrorList.reasonForVisiting = {
      text: 'Enter What was your reason for visiting the Beta service today?',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
