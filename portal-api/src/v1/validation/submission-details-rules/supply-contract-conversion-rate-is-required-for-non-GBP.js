const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

const A_NUMBER_WITH_UP_TO_SIX_DECIMAL_PLACES = /^[0-9]*(\.{0,1}[0-9]{0,6})$/;

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (hasValue(submissionDetails.supplyContractCurrency) && submissionDetails.supplyContractCurrency.id !== 'GBP') {
    if (!hasValue(submissionDetails.supplyContractConversionRateToGBP)) {
      newErrorList.supplyContractConversionRateToGBP = {
        order: orderNumber(newErrorList),
        text: 'Supply Contract conversion rate is required for non-GBP currencies',
      };
    } else if (!submissionDetails.supplyContractConversionRateToGBP.match(A_NUMBER_WITH_UP_TO_SIX_DECIMAL_PLACES)) {
      newErrorList.supplyContractConversionRateToGBP = {
        order: orderNumber(newErrorList),
        text: 'Supply Contract conversion rate must be a number with up to 6 decimal places',
      };
    }
  }
  return newErrorList;
};
