const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(submissionDetails['buyer-name'])) {
    newErrorList['buyer-name'] = {
      order: orderNumber(newErrorList),
      text: 'Buyer name is required',
    };
  }

  return newErrorList;
};
