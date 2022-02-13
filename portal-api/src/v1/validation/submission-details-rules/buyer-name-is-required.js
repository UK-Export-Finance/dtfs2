const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

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
