const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

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
