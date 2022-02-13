const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');
const { currencyIsDisabled } = require('../fields/currency');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };
  if (!submissionDetails.supplyContractCurrency || !hasValue(submissionDetails.supplyContractCurrency.id)) {
    newErrorList.supplyContractCurrency = {
      order: orderNumber(newErrorList),
      text: 'Supply Contract currency is required',
    };
  }

  if (submissionDetails.supplyContractCurrency) {
    const isDisabled = currencyIsDisabled(submissionDetails.supplyContractCurrency.id);
    if (isDisabled) {
      newErrorList.supplyContractCurrency = {
        order: orderNumber(newErrorList),
        text: 'Supply Contracy currency is no longer available',
      };
    }
  }

  return newErrorList;
};
