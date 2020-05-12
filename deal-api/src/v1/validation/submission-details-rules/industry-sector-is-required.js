const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(submissionDetails['industry-sector'])) {
    newErrorList['industry-sector'] = {
      order: orderNumber(newErrorList),
      text: 'Industry Sector is required',
    };
  }

  return newErrorList;
};
