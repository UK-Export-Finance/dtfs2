const V2_CONSTANTS = require('../../../portal-api/src/constants');
const MIGRATION_MAP = require('./migration-map');

const INVALID_STATUSES = [
  V2_CONSTANTS.DEAL.DEAL_STATUS.DRAFT,
  V2_CONSTANTS.DEAL.DEAL_STATUS.READY_FOR_APPROVAL,
  V2_CONSTANTS.DEAL.DEAL_STATUS.CHANGES_REQUIRED,
];

const shouldMigrateDeal = (v1Deal) => {
  const v1Status = v1Deal.field_deal_status;
  const v2Status = MIGRATION_MAP.DEAL.DEAL_STATUS[v1Status];

  const shouldMigrate = !INVALID_STATUSES.includes(v2Status);

  if (shouldMigrate) {
    return true;
  }

  return false;
};

module.exports = shouldMigrateDeal;
