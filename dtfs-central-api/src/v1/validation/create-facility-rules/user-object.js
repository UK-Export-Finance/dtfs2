const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (facility, errorList) => {
  const newErrorList = { ...errorList };
  const { user } = facility;

  if (!user
    || !user._id // eslint-disable-line no-underscore-dangle
    || !user.roles
    || !user.bank) {
    newErrorList.userObject = {
      order: orderNumber(newErrorList),
      text: 'User object with _id, roles and bank is required',
    };
  }

  return newErrorList;
};
