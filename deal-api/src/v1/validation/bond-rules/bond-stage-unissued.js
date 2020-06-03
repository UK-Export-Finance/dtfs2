const { hasValue } = require('../../../utils/string');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (bond, errorList) => {
  const newErrorList = { ...errorList };
  const {
    bondStage,
    ukefGuaranteeInMonths,
  } = bond;

  const isUnissued = (hasValue(bondStage) && bondStage === 'Unissued');

  if (isUnissued) {
    if (!hasValue(ukefGuaranteeInMonths)) {
      newErrorList.ukefGuaranteeInMonths = {
        order: orderNumber(newErrorList),
        text: 'Enter the Length of time that the UKEF\'s guarantee will be in place for',
      };
    }
  }

  return newErrorList;
};
