const getDealErrors = require('./deal');

exports.getCloneDealErrors = (deal, cloneTransactions) => {
  let errorList = {};
  const cloneDealErrorList = {};

  const dealErrors = getDealErrors(deal);
  if (dealErrors) {
    errorList = dealErrors.errorList;
  }

  if (!cloneTransactions) {
    const cloneTransactionsOrder = dealErrors.errorList ? Object.keys(dealErrors.errorList).length + 1 : 1;
    cloneDealErrorList.cloneTransactions = {
      order: cloneTransactionsOrder,
      text: 'Do you want to clone this deal with transactions is required',
    };
  }

  errorList = {
    ...errorList,
    ...cloneDealErrorList,
  };

  const totalErrors = Object.keys(errorList).length;

  if (totalErrors === 0) {
    return false;
  }

  return {
    count: totalErrors,
    errorList,
  };
};
