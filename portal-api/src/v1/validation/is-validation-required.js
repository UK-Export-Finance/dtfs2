const CONSTANTS = require('../../constants');

const statusToValidate = [
  CONSTANTS.DEAL.STATUS.DRAFT,
  CONSTANTS.DEAL.STATUS.INPUT_REQUIRED,
  CONSTANTS.DEAL.STATUS.READY_FOR_APPROVAL,
  CONSTANTS.DEAL.STATUS.ABANDONED,
];

module.exports = (deal) => {
  if (deal.dataMigrationInfo) {
    return false;
  }
  return statusToValidate.includes(deal.status);
};
