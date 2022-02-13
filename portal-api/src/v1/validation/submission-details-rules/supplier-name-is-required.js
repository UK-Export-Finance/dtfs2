const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(submissionDetails['supplier-name'])) {
    newErrorList['supplier-name'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier name is required',
    };
  }

  return newErrorList;
};
