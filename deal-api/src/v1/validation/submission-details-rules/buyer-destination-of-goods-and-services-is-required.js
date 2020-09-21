const { orderNumber } = require('../../../utils/error-list-order-number');
const { hasValue } = require('../../../utils/string');

module.exports = (submissionDetails, errorList) => {
  const newErrorList = { ...errorList };

  if (!submissionDetails['destinationOfGoodsAndServices'] || !hasValue(submissionDetails['destinationOfGoodsAndServices'].id)) {
    newErrorList['destinationOfGoodsAndServices'] = {
      order: orderNumber(newErrorList),
      text: 'Destination of Goods and Services is required',
    };
  }

  return newErrorList;
};
