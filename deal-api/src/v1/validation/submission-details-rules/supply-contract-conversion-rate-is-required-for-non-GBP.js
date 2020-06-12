const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

const SOME_NUMBERS_A_DOT_AND_UP_TO_SIX_NUMBERS = /^[0-9]*\.[0-9]{0,6}$/;

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (hasValue(submissionDetails.supplyContractCurrency) && submissionDetails.supplyContractCurrency.id !== 'GBP') {
    if (!hasValue(submissionDetails.supplyContractConversionRateToGBP)) {
      newErrorList.supplyContractConversionRateToGBP = {
        order: orderNumber(newErrorList),
        text: 'Supply Contract conversion rate is required for non-GBP currencies',
      };
    } else if (!submissionDetails.supplyContractConversionRateToGBP.match(SOME_NUMBERS_A_DOT_AND_UP_TO_SIX_NUMBERS)) {
      newErrorList.supplyContractConversionRateToGBP = {
        order: orderNumber(newErrorList),
        text: 'Supply Contract conversion rate must be a number with up to 6 decimal places',
      };
    }
  }
  return newErrorList;
};
