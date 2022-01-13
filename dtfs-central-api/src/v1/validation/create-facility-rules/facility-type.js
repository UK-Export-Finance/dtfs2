const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');
const { FACILITY_TYPE } = require('../../../constants/facilities');

module.exports = (facility = {}, errorList) => {
  const newErrorList = { ...errorList };
  const { facilityType } = facility;

  if (!hasValue(facilityType)) {
    newErrorList.facilityType = {
      order: orderNumber(newErrorList),
      text: 'Enter the Facility type',
    };
  }

  if (hasValue(facilityType)) {
    if (facilityType !== FACILITY_TYPE.BOND && facilityType !== FACILITY_TYPE.LOAN) {
      newErrorList.facilityType = {
        order: orderNumber(newErrorList),
        text: 'Facility type must be Bond or Loan',
      };
    }
  }

  return newErrorList;
};
