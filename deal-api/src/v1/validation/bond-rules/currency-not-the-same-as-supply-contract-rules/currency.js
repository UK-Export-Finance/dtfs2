const { hasValue } = require('../../../../utils/string');
const { orderNumber } = require('../../../../utils/error-list-order-number');

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(bond.currency)) {
    newErrorList.currency = {
      order: orderNumber(newErrorList),
      text: 'Enter the Currency',
    };
  }

  return newErrorList;
};
