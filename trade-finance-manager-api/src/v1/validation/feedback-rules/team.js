const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.team)) {
    newErrorList.team = {
      text: 'Enter which team you work for',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
