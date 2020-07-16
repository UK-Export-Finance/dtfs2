const { hasValue } = require('../../../utils/string');
const { isNumeric } = require('../../../utils/number');
const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (feedback, errorList) => {
  const newErrorList = { ...errorList };

  // TODO: 'is this an email' rule.
 
  return newErrorList;
};
