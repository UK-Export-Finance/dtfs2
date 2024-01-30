const { isNonEmptyString } = require('@ukef/dtfs2-common');
const { orderNumber } = require('../../../utils/error-list-order-number');

const MAX_CHARACTERS = 30;

module.exports = (deal, errorList) => {
  const newErrorList = { ...errorList };
  const { bankInternalRefName } = deal;

  if (!isNonEmptyString(bankInternalRefName)) {
    newErrorList.bankInternalRefName = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bank deal ID',
    };
  }

  if (isNonEmptyString(bankInternalRefName)) {
    if (bankInternalRefName.length > MAX_CHARACTERS) {
      newErrorList.bankInternalRefName = {
        order: orderNumber(newErrorList),
        text: `Bank deal ID must be ${MAX_CHARACTERS} characters or fewer`,
      };
    }
  }

  return newErrorList;
};
