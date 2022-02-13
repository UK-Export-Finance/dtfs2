const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

const MAX_CHARACTERS = 100;

module.exports = (deal, errorList) => {
  const newErrorList = { ...errorList };
  const { additionalRefName } = deal;

  if (!hasValue(additionalRefName)) {
    newErrorList.additionalRefName = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bank deal name',
    };
  }

  if (hasValue(additionalRefName)) {
    if (additionalRefName.length > MAX_CHARACTERS) {
      newErrorList.additionalRefName = {
        order: orderNumber(newErrorList),
        text: `Bank deal name must be ${MAX_CHARACTERS} characters or fewer`,
      };
    }
  }

  return newErrorList;
};
