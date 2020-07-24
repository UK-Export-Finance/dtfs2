const { orderNumber } = require('../../../utils/error-list-order-number');

module.exports = (fieldValue, fieldName, fieldTitle, errorList) => {
  const newErrorList = { ...errorList };

  if (fieldValue.match(/[^A-Za-z0-9_\- ]/)) {
    newErrorList[fieldName] = {
      order: orderNumber(newErrorList),
      text: `${fieldTitle} must only include letters a to z, numbers 0 to 9, hyphens, underscores and spaces`,
    };
  }

  return newErrorList;
};
