exports.getDealErrors = (deal) => {
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

  return {
    count: Object.keys(errorList).length,
    errorList,
  };
};
