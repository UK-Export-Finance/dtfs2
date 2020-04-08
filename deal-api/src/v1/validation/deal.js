exports.getDealErrors = (deal) => {
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

  const totalErrors = Object.keys(errorList).length;

  if (totalErrors === 0) {
    return false;
  }

  return {
    count: totalErrors,
    errorList,
  };
};
