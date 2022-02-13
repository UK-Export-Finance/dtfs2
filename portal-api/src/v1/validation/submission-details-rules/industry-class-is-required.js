const { orderNumber } = require('../../../utils/error-list-order-number.util');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  const industryClass = submissionDetails['industry-class'];

  if (!industryClass || Object.keys(industryClass).length < 2) {
    newErrorList['industry-class'] = {
      order: orderNumber(newErrorList),
      text: 'Industry Class is required',
    };
  }

  return newErrorList;
};
