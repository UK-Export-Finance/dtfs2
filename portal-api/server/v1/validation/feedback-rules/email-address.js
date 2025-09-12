const { hasValue, isValidEmail } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (hasValue(feedback.emailAddress) && !isValidEmail(feedback.emailAddress)) {
    newErrorList.emailAddress = {
      text: 'Enter an email address in the correct format, for example, name@ukexportfinance.gov.uk',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
