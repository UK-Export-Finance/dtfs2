const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (deal, errorList) => {
  const newErrorList = { ...errorList };
  const { maker, owningBank } = deal.details;

  if (!maker
    || !maker._id
    || !owningBank) {
    newErrorList.makerObject = {
      order: orderNumber(newErrorList),
      text: 'deal.details.maker object with bank is required',
    };
  }

  return newErrorList;
};
