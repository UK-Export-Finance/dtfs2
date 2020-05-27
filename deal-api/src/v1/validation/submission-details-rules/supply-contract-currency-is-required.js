const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };
  if (!submissionDetails.supplyContractCurrency || !hasValue(submissionDetails.supplyContractCurrency.id)) {
    newErrorList.supplyContractCurrency = {
      order: orderNumber(newErrorList),
      text: 'Supply Contract currency is required',
    };
  }

  return newErrorList;
};
