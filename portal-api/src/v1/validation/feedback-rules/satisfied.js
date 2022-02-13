const { hasValue } = require('../../../utils/string.util');
const { orderNumber } = require('../../../utils/error-list-order-number.util');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.satisfied)) {
    newErrorList.satisfied = {
      text: 'Select a rating for how satisfied you are with the service',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
