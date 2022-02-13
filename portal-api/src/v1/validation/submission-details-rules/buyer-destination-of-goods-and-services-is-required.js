const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (!submissionDetails.destinationOfGoodsAndServices
      || !hasValue(submissionDetails.destinationOfGoodsAndServices.code)) {
    newErrorList.destinationOfGoodsAndServices = {
      order: orderNumber(newErrorList),
      text: 'Destination of Goods and Services is required',
    };
  }

  return newErrorList;
};
