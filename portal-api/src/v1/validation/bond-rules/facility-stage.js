const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

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
