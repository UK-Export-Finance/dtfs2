const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.whyUsingService)) {
    newErrorList.whyUsingService = {
      text: 'Enter your reason for using this service today',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
