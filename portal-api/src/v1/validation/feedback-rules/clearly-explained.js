const { hasValue } = require('../../../utils/string.util');
const { orderNumber } = require('../../../utils/error-list-order-number.util');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.clearlyExplained)) {
    newErrorList.clearlyExplained = {
      text: 'Select a rating for how clearly explained the information you need to provide is',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
