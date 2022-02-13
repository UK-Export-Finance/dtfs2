const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(submissionDetails['supplier-type'])) {
    newErrorList['supplier-type'] = {
      order: orderNumber(newErrorList),
      text: 'Supplier type is required',
    };
  }

  return newErrorList;
};
