const { isNonEmptyString } = require('@ukef/dtfs2-common');
const { orderNumber } = require('../../../utils/error-list-order-number');

const MAX_CHARACTERS = 100;

module.exports = (deal, errorList) => {
  const newErrorList = { ...errorList };
  const { additionalRefName } = deal;

  if (!isNonEmptyString(additionalRefName)) {
    newErrorList.additionalRefName = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bank deal name',
    };
  }

  if (isNonEmptyString(additionalRefName)) {
    if (additionalRefName.length > MAX_CHARACTERS) {
      newErrorList.additionalRefName = {
        order: orderNumber(newErrorList),
        text: `Bank deal name must be ${MAX_CHARACTERS} characters or fewer`,
      };
    }
  }

  return newErrorList;
};
