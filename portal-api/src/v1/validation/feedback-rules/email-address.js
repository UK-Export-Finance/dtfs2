const { hasValue } = require('../../../utils/string.util');
const { orderNumber } = require('../../../utils/error-list-order-number.util');

const isValidEmail = (email) => {
  const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  if (hasValue(feedback.emailAddress) && !isValidEmail(feedback.emailAddress)) {
    newErrorList.emailAddress = {
      text: 'Enter an email address in the correct format, like name@example.com',
      order: orderNumber(newErrorList),
    };
  }

  return newErrorList;
};
