exports.getDealErrors = (deal, cloneTransactions) => {
  const { details } = deal;
  const {
    bankSupplyContractID,
    bankSupplyContractName,
  } = details;

  const errorList = {};

  if (!bankSupplyContractID) {
    errorList.bankSupplyContractID = {
      order: '1',
      text: 'Bank deal ID is required',
    };
  }

  if (!bankSupplyContractName) {
    errorList.bankSupplyContractName = {
      order: '2',
      text: 'Bank deal name is required',
    };
  }

  if (!cloneTransactions) {
    errorList.cloneTransactions = {
      order: '3',
      text: 'Do you want to clone this deal with transactions is required',
    };
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
