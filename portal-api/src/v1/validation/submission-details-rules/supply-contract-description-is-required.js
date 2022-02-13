const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };
  if (!hasValue(submissionDetails['supply-contract-description'])) {
    newErrorList['supply-contract-description'] = {
      order: orderNumber(newErrorList),
      text: 'Supply Contract Description is required',
    };
  }

  return newErrorList;
};
