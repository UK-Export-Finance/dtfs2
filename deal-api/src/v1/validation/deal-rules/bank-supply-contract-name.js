const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

const MAX_CHARACTERS = 100;

module.exports = (deal, errorList) => {
  const newErrorList = { ...errorList };
  const { bankSupplyContractName } = deal.details;

  if (!hasValue(bankSupplyContractName)) {
    newErrorList.bankSupplyContractName = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bank deal name',
    };
  }

  if (hasValue(bankSupplyContractName)) {
    // TODO: reuse match regex
    if (bankSupplyContractName.match(/[^A-Za-z0-9_\- ]/)) {
      newErrorList.bankSupplyContractName = {
        order: orderNumber(newErrorList),
        text: 'Bank deal name must only include letters a to z, numbers 0 to 9, hyphens, underscores and spaces',
      };
    }

    if (bankSupplyContractName.length > MAX_CHARACTERS) {
      newErrorList.bankSupplyContractName = {
        order: orderNumber(newErrorList),
        text: `Bank deal name must be ${MAX_CHARACTERS} characters or fewer`,
      };
    }
  }

  return newErrorList;
};
