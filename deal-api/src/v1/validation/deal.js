exports.getDealErrors = (deal, cloneTransactions) => {
  const { details } = deal;
  const {
    bankSupplyContractID,
    supplyContractName,
  } = details;

  const errorList = {};

  if (!bankSupplyContractID) {
    errorList.bankSupplyContractID = 'Bank deal ID is required';
  }

  if (!supplyContractName) {
    errorList.supplyContractName = 'Bank deal name is required';
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
