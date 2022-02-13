const { hasValue } = require('../../../utils/string.util');
const { orderNumber } = require('../../../utils/error-list-order-number.util');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.easyToUse)) {
    newErrorList.easyToUse = {
      text: 'Select a rating for how easy the service is to use',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
