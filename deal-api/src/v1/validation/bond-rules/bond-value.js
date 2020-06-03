const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(bond.bondValue)) {
    newErrorList.bondValue = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bond value',
    };
  }

  return newErrorList;
};
