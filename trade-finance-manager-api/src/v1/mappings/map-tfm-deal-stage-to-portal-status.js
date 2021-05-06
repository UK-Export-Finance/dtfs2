const CONSTANTS = require('../../constants');

const mapTfmDealStageToPortalStatus = (tfmStatus) => {
  if (tfmStatus === CONSTANTS.DEALS.DEAL_STAGE_TFM.APPROVED_WITH_CONDITIONS) {
    return CONSTANTS.DEALS.DEAL_STATUS_PORTAL.APPROVED_WITH_CONDITIONS;
  }

  if (tfmStatus === CONSTANTS.DEALS.DEAL_STAGE_TFM.APPROVED_WITHOUT_CONDITIONS) {
    return CONSTANTS.DEALS.DEAL_STATUS_PORTAL.APPROVED_WITHOUT_CONDITIONS;
  }

  if (tfmStatus === CONSTANTS.DEALS.DEAL_STAGE_TFM.DECLINED) {
    return CONSTANTS.DEALS.DEAL_STATUS_PORTAL.REFUSED;
  }

  return null;
};

module.exports = mapTfmDealStageToPortalStatus;
