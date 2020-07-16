const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.clearlyExplained)) {
    newErrorList.clearlyExplained = {
      text: 'Enter Information required is clearly explained',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
