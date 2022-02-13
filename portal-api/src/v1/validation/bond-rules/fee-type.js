const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(bond.feeType)) {
    newErrorList.feeType = {
      order: orderNumber(newErrorList),
      text: 'Enter the Fee type',
    };
  }

  if (bond.feeType === 'In advance' || bond.feeType === 'In arrear') {
    if (!hasValue(bond.feeFrequency)) {
      newErrorList.feeFrequency = {
        order: orderNumber(newErrorList),
        text: 'Enter the Fee frequency',
      };
    }
  }

  return newErrorList;
};
