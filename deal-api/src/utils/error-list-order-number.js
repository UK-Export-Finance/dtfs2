exports.orderNumber = (errorList) => {
  const hasErrors = Object.keys(errorList).length > 0;

  if (hasErrors) {
    const lastFieldName = Object.keys(errorList)[Object.keys(errorList).length - 1];
    const lastFieldOrderNumber = Number(errorList[lastFieldName].order);
    return String(lastFieldOrderNumber + 1);
  }
  return '1';
};
