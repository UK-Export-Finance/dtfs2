const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.organisation)) {
    newErrorList.organisation = {
      text: 'Enter which organisation you work for',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
