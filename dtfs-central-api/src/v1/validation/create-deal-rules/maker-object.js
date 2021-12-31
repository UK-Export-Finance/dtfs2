const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (deal, errorList) => {
  const newErrorList = { ...errorList };
  const { bank, details } = deal;
  const { maker } = details;

  if (!maker
    || !maker._id
    || !bank) {
    newErrorList.makerObject = {
      order: orderNumber(newErrorList),
      text: 'deal.details.maker object with bank is required',
    };
  }

  return newErrorList;
};
