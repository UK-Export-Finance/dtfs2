const { isNonEmptyString } = require('@ukef/dtfs2-common');
const { orderNumber } = require('../../../utils/error-list-order-number');

// eslint-disable-next-line default-param-last
module.exports = (facility = {}, errorList) => {
  const newErrorList = { ...errorList };
  const { dealId } = facility;

  if (!isNonEmptyString(dealId)) {
    newErrorList.dealId = {
      order: orderNumber(newErrorList),
      text: 'Enter the Associated deal id',
    };
  }

  return newErrorList;
};
