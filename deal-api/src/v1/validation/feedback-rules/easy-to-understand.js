const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.easyToUnderstand)) {
    newErrorList.easyToUnderstand = {
      text: 'Enter Information required is easy to understand',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
