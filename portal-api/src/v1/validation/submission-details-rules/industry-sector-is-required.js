const { orderNumber } = require('../../../utils/error-list-order-number.util');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  const industrySector = submissionDetails['industry-sector'];

  if (!industrySector || Object.keys(industrySector).length < 2) {
    newErrorList['industry-sector'] = {
      order: orderNumber(newErrorList),
      text: 'Industry Sector is required',
    };
  }

  return newErrorList;
};
