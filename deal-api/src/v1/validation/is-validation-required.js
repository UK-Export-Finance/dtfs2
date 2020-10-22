const CONSTANTS = require('../../constants');

const dealStatusToValidateOn = [
  CONSTANTS.DEAL.STATUS.DRAFT,
  CONSTANTS.DEAL.STATUS.INPUT_REQUIRED,
  CONSTANTS.DEAL.STATUS.READY_FOR_APPROVAL,
];

module.exports = (deal) => dealStatusToValidateOn.includes(deal.details.status);
