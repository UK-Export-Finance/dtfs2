const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');
const { FACILITY_TYPE } = require('../../../constants/facilities');

module.exports = (facility = {}, errorList) => {
  const newErrorList = { ...errorList };
  const { type } = facility;

  if (!hasValue(type)) {
    newErrorList.type = {
      order: orderNumber(newErrorList),
      text: 'Enter the Facility type',
    };
  }

  if (hasValue(type)) {
    if (type !== FACILITY_TYPE.BOND && type !== FACILITY_TYPE.LOAN) {
      newErrorList.type = {
        order: orderNumber(newErrorList),
        text: 'Facility type must be Bond or Loan',
      };
    }
  }

  return newErrorList;
};
