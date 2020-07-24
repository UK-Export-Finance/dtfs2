const { orderNumber } = require('../../../utils/error-list-order-number');
const idField = require('../fields/id-field');
const { hasValue } = require('../../../utils/string');

const MAX_CHARACTERS = 100;

module.exports = (deal, errorList) => {
  let newErrorList = { ...errorList };
  const { bankSupplyContractName } = deal.details;

  if (!hasValue(bankSupplyContractName)) {
    newErrorList.bankSupplyContractName = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bank deal name',
    };
  }

  if (hasValue(bankSupplyContractName)) {
    newErrorList = idField(
      bankSupplyContractName,
      'bankSupplyContractName',
      'Bank deal name',
      newErrorList,
    );

    if (bankSupplyContractName.length > MAX_CHARACTERS) {
      newErrorList.bankSupplyContractName = {
        order: orderNumber(newErrorList),
        text: `Bank deal name must be ${MAX_CHARACTERS} characters or fewer`,
      };
    }
  }

  return newErrorList;
};
