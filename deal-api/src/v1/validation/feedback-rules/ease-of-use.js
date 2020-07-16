const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.easeOfUse)) {
    newErrorList.easeOfUse = {
      text: 'Enter the Ease of use',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
