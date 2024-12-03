const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

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
