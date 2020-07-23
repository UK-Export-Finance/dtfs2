const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

const MAX_CHARACTERS = 30;

module.exports = (deal, errorList) => {
  const newErrorList = { ...errorList };
  const { bankSupplyContractID } = deal.details;

  if (!hasValue(bankSupplyContractID)) {
    newErrorList.bankSupplyContractID = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bank deal ID',
    };
  }

  if (hasValue(bankSupplyContractID)) {
    // TODO: reuse match regex
    if (bankSupplyContractID.match(/[^A-Za-z0-9_\- ]/)) {
      newErrorList.bankSupplyContractID = {
        order: orderNumber(newErrorList),
        text: 'Bank deal ID must only include letters a to z, numbers 0 to 9, hyphens, underscores and spaces',
      };
    }

    if (bankSupplyContractID.length > MAX_CHARACTERS) {
      newErrorList.bankSupplyContractID = {
        order: orderNumber(newErrorList),
        text: `Bank deal ID must be ${MAX_CHARACTERS} characters or fewer`,
      };
    }
  }

  return newErrorList;
};
