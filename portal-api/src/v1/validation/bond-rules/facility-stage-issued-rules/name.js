const { hasValue } = require('../../../../utils/string.util');
const { orderNumber } = require('../../../../utils/error-list-order-number.util');

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };

  const MAX_CHARACTERS = 30;

  if (!hasValue(bond.name)) {
    newErrorList.name = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bond\'s unique identification number',
    };
  }

  if (hasValue(bond.name)) {
    if (bond.name.length > MAX_CHARACTERS) {
      newErrorList.name = {
        order: orderNumber(newErrorList),
        text: `Bond's unique identification number must be ${MAX_CHARACTERS} characters or fewer`,
      };
    }
  }

  return newErrorList;
};
