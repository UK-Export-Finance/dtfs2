const V2_CONSTANTS = require('../../../../portal-api/src/constants');

const INVALID_STATUSES = [
  V2_CONSTANTS.DEAL.DEAL_STATUS.DRAFT,
  V2_CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL,
  V2_CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED,
];

const shouldMigrateDeal = (v2Status) => {
  const shouldMigrate = !INVALID_STATUSES.includes(v2Status);

  if (shouldMigrate) {
    return true;
  }

  return false;
};

module.exports = shouldMigrateDeal;
