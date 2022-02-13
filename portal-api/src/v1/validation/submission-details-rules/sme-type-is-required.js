const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(submissionDetails['sme-type'])) {
    newErrorList['sme-type'] = {
      order: orderNumber(newErrorList),
      text: 'SME type is required',
    };
  }

  return newErrorList;
};
