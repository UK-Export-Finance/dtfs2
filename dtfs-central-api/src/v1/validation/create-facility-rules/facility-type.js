const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (facility, errorList) => {
  const newErrorList = { ...errorList };
  const { facilityType } = facility;

  if (!hasValue(facilityType)) {
    newErrorList.facilityType = {
      order: orderNumber(newErrorList),
      text: 'Enter the Facility type',
    };
  }

  if (hasValue(facilityType)) {
    if (facilityType !== 'bond' && facilityType !== 'loan') {
      newErrorList.facilityType = {
        order: orderNumber(newErrorList),
        text: 'Facility type must be bond or loan',
      };
    }
  }

  return newErrorList;
};
