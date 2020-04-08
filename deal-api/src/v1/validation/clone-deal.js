const { getDealErrors } = require('./deal');

exports.getCloneDealErrors = (deal, cloneTransactions) => {
  let errorList = {};
  const cloneDealErrorList = {};

  const dealErrors = getDealErrors(deal);
  if (dealErrors) {
    errorList = dealErrors.errorList;
  }

  // TODO: get cloneTransactions order to be based on deal errorList
  if (!cloneTransactions) {
    cloneDealErrorList.cloneTransactions = {
      order: '3',
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
