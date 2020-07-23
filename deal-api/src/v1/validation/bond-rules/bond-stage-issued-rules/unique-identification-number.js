const { hasValue } = require('../../../../utils/string');
const { orderNumber } = require('../../../../utils/error-list-order-number');

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  // TODO: max 30 characters

  if (!hasValue(bond.uniqueIdentificationNumber)) {
    newErrorList.uniqueIdentificationNumber = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bond\'s unique identification number',
    };
  }

  return newErrorList;
};
