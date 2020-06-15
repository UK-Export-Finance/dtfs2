const { hasValue } = require('../../../../utils/string');
const { orderNumber } = require('../../../../utils/error-list-order-number');

module.exports = (facility, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(facility.currency)) {
    newErrorList.currency = {
      order: orderNumber(newErrorList),
      text: 'Enter the Currency',
    };
  }

  return newErrorList;
};
