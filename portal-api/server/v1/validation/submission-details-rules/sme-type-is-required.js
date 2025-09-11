const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

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
