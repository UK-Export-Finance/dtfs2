const CONSTANTS = require('../../constants');

const statusToValidate = [
  CONSTANTS.DEAL.DEAL_STATUS.DRAFT,
  CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED,
  CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL,
  CONSTANTS.DEAL.DEAL_STATUS.ABANDONED,
];

module.exports = (deal) => {
  if (deal.dataMigrationInfo) {
    return false;
  }
  return statusToValidate.includes(deal.status);
};
