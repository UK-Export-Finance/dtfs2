const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };
  const {
    transactionCurrencySameAsSupplyContractCurrency,
  } = bond;

  if (!hasValue(transactionCurrencySameAsSupplyContractCurrency)) {
    newErrorList.transactionCurrencySameAsSupplyContractCurrency = {
      order: orderNumber(newErrorList),
      text: 'Select if the currency for this Transaction is the same as your Supply Contract currency',
    };
  }

  return newErrorList;
};
