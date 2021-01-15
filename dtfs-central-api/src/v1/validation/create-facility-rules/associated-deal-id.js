const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (facility = {}, errorList) => {
  const newErrorList = { ...errorList };
  const { associatedDealId } = facility;

  if (!hasValue(associatedDealId)) {
    newErrorList.associatedDealId = {
      order: orderNumber(newErrorList),
      text: 'Enter the Associated deal id',
    };
  }

  return newErrorList;
};
