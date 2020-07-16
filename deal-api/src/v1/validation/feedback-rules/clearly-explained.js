const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.clearlyExplained)) {
    newErrorList.clearlyExplained = {
      text: 'Select a rating for how clearly it\'s explained what information you need to provided',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
