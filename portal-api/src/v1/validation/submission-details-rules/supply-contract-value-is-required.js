const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');
const { sanitizeCurrency } = require('../../../utils/number');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };
  if (!hasValue(submissionDetails.supplyContractValue)) {
    newErrorList.supplyContractValue = {
      order: orderNumber(newErrorList),
      text: 'Supply Contract value is required',
    };
    return newErrorList;
  }

  const { isCurrency } = sanitizeCurrency(submissionDetails.supplyContractValue);

  if (!isCurrency) {
    newErrorList.supplyContractValue = {
      order: orderNumber(newErrorList),
      text: 'Supply Contract value must be in currency format',
    };
  }

  return newErrorList;
};
