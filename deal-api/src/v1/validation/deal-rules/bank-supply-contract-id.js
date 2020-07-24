const { orderNumber } = require('../../../utils/error-list-order-number');
const idField = require('../fields/id-field');
const { hasValue } = require('../../../utils/string');

const MAX_CHARACTERS = 30;

module.exports = (deal, errorList) => {
  let newErrorList = { ...errorList };
  const { bankSupplyContractID } = deal.details;

  if (!hasValue(bankSupplyContractID)) {
    newErrorList.bankSupplyContractID = {
      order: orderNumber(newErrorList),
      text: 'Enter the Bank deal ID',
    };
  }

  if (hasValue(bankSupplyContractID)) {
    newErrorList = idField(
      bankSupplyContractID,
      'bankSupplyContractID',
      'Bank deal ID',
      newErrorList,
    );

    if (bankSupplyContractID.length > MAX_CHARACTERS) {
      newErrorList.bankSupplyContractID = {
        order: orderNumber(newErrorList),
        text: `Bank deal ID must be ${MAX_CHARACTERS} characters or fewer`,
      };
    }
  }

  return newErrorList;
};
