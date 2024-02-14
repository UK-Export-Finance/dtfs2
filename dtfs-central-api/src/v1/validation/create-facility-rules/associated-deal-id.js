const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (facility, errorList) => {
  const newErrorList = { ...errorList };
  const dealId = facility?.dealId;

  if (!hasValue(dealId)) {
    newErrorList.dealId = {
      order: orderNumber(newErrorList),
      text: 'Enter the Associated deal id',
    };
  }

  return newErrorList;
};
