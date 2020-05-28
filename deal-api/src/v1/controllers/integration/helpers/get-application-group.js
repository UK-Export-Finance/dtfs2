const CONSTANTS = require('../../../../constants');

const getApplicationGroup = (deal) => {
  const bssCount = deal.bondTransactions.items.filter((b) => b.status === CONSTANTS.FACILITIES.STATUS.COMPLETED).length;
  const ewcsCount = deal.loanTransactions.items.filter((l) => l.status === CONSTANTS.FACILITIES.STATUS.COMPLETED).length;

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
