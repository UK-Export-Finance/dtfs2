exports.getDealErrors = (deal, cloneTransactions) => {
  const { details } = deal;
  const {
    bankDealId,
    bankDealName,
  } = details;

  const errorList = {};

  if (!bankDealId) {
    errorList.bankDealId = 'Bank deal ID is required';
  }

  if (!bankDealName) {
    errorList.bankDealName = 'Bank deal name is required';
  }

  if (!cloneTransactions) {
    errorList.cloneTransactions = 'Do you want to clone this deal with transactions is required';
  }

  const totalErrors = Object.keys(errorList).length;

  if (totalErrors === 0) {
    return false;
  }

  return {
    count: totalErrors,
    errorList,
  };
};
