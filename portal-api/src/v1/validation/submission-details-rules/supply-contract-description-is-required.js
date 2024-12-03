const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

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
