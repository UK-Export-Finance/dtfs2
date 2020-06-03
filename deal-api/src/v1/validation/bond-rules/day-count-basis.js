const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(bond.dayCountBasis)) {
    newErrorList.dayCountBasis = {
      order: orderNumber(newErrorList),
      text: 'Enter the Day count basis',
    };
  }

  return newErrorList;
};
