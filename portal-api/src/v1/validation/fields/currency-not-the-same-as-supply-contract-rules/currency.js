const { hasValue } = require('../../../../utils/string.util');
const { orderNumber } = require('../../../../utils/error-list-order-number.util');
const { currencyIsDisabled } = require('../currency');

module.exports = (facility, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(facility.currency)) {
    newErrorList.currency = {
      order: orderNumber(newErrorList),
      text: 'Enter the Currency',
    };
  } else {
    const isDisabled = currencyIsDisabled(facility.currency.id);
    if (isDisabled) {
      newErrorList.currency = {
        order: orderNumber(newErrorList),
        text: 'Facility currency is no longer available',
      };
    }
  }

  return newErrorList;
};
