const CONSTANTS = require('../../constants');

const mapTfmDealStageToPortalStatus = (tfmStatus) => {
  if (tfmStatus === CONSTANTS.DEALS.DEAL_STAGE_TFM.APPROVED_WITH_CONDITIONS) {
    return CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.APPROVED_WITH_CONDITIONS;
  }

  if (tfmStatus === CONSTANTS.DEALS.DEAL_STAGE_TFM.APPROVED_WITHOUT_CONDITIONS) {
    return CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.APPROVED_WITHOUT_CONDITIONS;
  }

  if (tfmStatus === CONSTANTS.DEALS.DEAL_STAGE_TFM.DECLINED) {
    return CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.REFUSED;
  }

  return null;
};

module.exports = mapTfmDealStageToPortalStatus;
