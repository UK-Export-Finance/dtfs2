const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.satisfied)) {
    newErrorList.satisfied = {
      text: 'Enter Overall, were you satisfied with the Beta service?',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
