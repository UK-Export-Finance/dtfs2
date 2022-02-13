const { hasValue } = require('../../../utils/string.util');
const { orderNumber } = require('../../../utils/error-list-order-number.util');

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
