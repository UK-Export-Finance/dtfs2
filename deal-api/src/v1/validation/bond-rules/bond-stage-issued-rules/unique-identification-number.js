const { hasValue } = require('../../../../utils/string');
const idField = require('../../fields/id-field');
const { orderNumber } = require('../../../../utils/error-list-order-number');

module.exports = (bond, errorList) => {
  let newErrorList = { ...errorList };

  const MAX_CHARACTERS = 30;

  if (!hasValue(bond.uniqueIdentificationNumber)) {
    newErrorList.uniqueIdentificationNumber = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bond\'s unique identification number',
    };
  }

  if (hasValue(bond.uniqueIdentificationNumber)) {
    newErrorList = idField(
      bond.uniqueIdentificationNumber,
      'uniqueIdentificationNumber',
      'Bond\'s unique identification number',
      newErrorList,
    );

    if (bond.uniqueIdentificationNumber.length > MAX_CHARACTERS) {
      newErrorList.uniqueIdentificationNumber = {
        order: orderNumber(newErrorList),
        text: `Bond's unique identification number must be ${MAX_CHARACTERS} characters or fewer`,
      };
    }
  }

  return newErrorList;
};
