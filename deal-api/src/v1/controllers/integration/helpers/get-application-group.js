const CONSTANTS = require('../../../../constants');

const getApplicationGroup = (deal) => {
  const bssCount = deal.bondTransactions.items.length;
  const ewcsCount = deal.loanTransactions.items.length;

  if (bssCount && ewcsCount) {
    return CONSTANTS.DEAL.APPLICATION_GROUP.BSS_AND_EWCS;
  }

  if (bssCount) {
    return CONSTANTS.DEAL.APPLICATION_GROUP.BSS;
  }

  if (ewcsCount) {
    return CONSTANTS.DEAL.APPLICATION_GROUP.EWCS;
  }

  return false;
};

module.exports = getApplicationGroup;
