const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (facility, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(facility.dayCountBasis)) {
    newErrorList.dayCountBasis = {
      order: orderNumber(newErrorList),
      text: 'Enter the Day count basis',
    };
  }

  return newErrorList;
};
