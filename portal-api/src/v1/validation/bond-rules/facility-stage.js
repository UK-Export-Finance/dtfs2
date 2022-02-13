const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(bond.facilityStage)) {
    newErrorList.facilityStage = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bond stage',
    };
  }

  return newErrorList;
};
