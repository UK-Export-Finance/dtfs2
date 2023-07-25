const joi = require('joi');
const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

const isValidEmail = (email) => {
  const schema = joi.string().email();

  const validation = schema.validate(email);

  return !validation.error;
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
