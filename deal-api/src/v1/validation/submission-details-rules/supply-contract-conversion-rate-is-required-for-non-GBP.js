const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (hasValue(submissionDetails.supplyContractCurrency) && submissionDetails.supplyContractCurrency.id !== 'GBP') {
    if (!hasValue(submissionDetails.supplyContractConversionRateToGBP)) {
      newErrorList.supplyContractConversionRateToGBP = {
        order: orderNumber(newErrorList),
        text: 'Supply Contract conversion rate is required for non-GBP currencies',
      };
    }
  }
  return newErrorList;
};
