const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(feedback.reasonForVisiting)) {
    newErrorList.reasonForVisiting = {
      text: 'Select your reason for visiting the service today',
      order: orderNumber(newErrorList),
    };
  }

  if (hasValue(feedback.reasonForVisiting)
    && feedback.reasonForVisiting === 'Other'
    && !hasValue(feedback.reasonForVisitingOther)) {
    newErrorList.reasonForVisitingOther = {
      text: 'Enter your reason for visiting the service today',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
