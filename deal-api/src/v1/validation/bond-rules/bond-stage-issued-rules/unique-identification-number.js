const { hasValue } = require('../../../../utils/string');
const { orderNumber } = require('../../../../utils/error-list-order-number');

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  const MAX_CHARACTERS = 30;

  if (!hasValue(bond.uniqueIdentificationNumber)) {
    newErrorList.uniqueIdentificationNumber = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bond\'s unique identification number',
    };
  }

  if (hasValue(bond.uniqueIdentificationNumber)) {
    // TODO: reuse match regex
    if (uniqueIdentificationNumber.match(/[^A-Za-z0-9_\- ]/)) {
      newErrorList.uniqueIdentificationNumber = {
        order: orderNumber(newErrorList),
        text: 'Bond\'s unique identification number must only include letters a to z, numbers 0 to 9, hyphens, underscores and spaces',
      };
    }

    if (bond.uniqueIdentificationNumber.length > MAX_CHARACTERS) {
      newErrorList.uniqueIdentificationNumber = {
        order: orderNumber(newErrorList),
        text: `Bond\'s unique identification number must be ${MAX_CHARACTERS} characters or fewer`,
      };
    }
  }

  return newErrorList;
};
