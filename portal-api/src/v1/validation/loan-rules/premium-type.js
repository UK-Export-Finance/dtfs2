const { orderNumber } = require('../../../utils/error-list-order-number.util');
const { hasValue } = require('../../../utils/string.util');

module.exports = (loan, errorList) => {
  const newErrorList = { ...errorList };

  if (!hasValue(loan.premiumType)) {
    newErrorList.premiumType = {
      order: orderNumber(newErrorList),
      text: 'Enter the Premium type',
    };
  }

  if (loan.premiumType === 'In advance' || loan.premiumType === 'In arrear') {
    if (!hasValue(loan.premiumFrequency)) {
      newErrorList.premiumFrequency = {
        order: orderNumber(newErrorList),
        text: 'Enter the Premium frequency',
      };
    }
  }

  return newErrorList;
};
