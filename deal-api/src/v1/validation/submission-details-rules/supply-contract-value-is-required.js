const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };
  if (!hasValue(submissionDetails.supplyContractValue)) {
    newErrorList.supplyContractValue = {
      order: orderNumber(newErrorList),
      text: 'Supply Contract value is required',
    };
  }

  return newErrorList;
};
