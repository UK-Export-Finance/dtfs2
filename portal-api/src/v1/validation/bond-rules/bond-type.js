const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(bond.bondType)) {
    newErrorList.bondType = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bond type',
    };
  }

  return newErrorList;
};
