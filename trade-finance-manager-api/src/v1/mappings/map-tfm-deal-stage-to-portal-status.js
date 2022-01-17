const CONSTANTS = require('../../constants');

const mapTfmDealStageToPortalStatus = (dealType, tfmStatus) => {
  if (tfmStatus === CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITH_CONDITIONS) {
    switch (dealType) {
      case CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS:
        return CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.UKEF_APPROVED_WITH_CONDITIONS;

      case CONSTANTS.DEALS.DEAL_TYPE.GEF:
        return CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.UKEF_APPROVED_WITH_CONDITIONS;

      default:
        return null;
    }
  }

  if (tfmStatus === CONSTANTS.DEALS.DEAL_STAGE_TFM.APPROVED_WITHOUT_CONDITIONS) {
    switch (dealType) {
      case CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS:
        return CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.APPROVED_WITHOUT_CONDITIONS;

      case CONSTANTS.DEALS.DEAL_TYPE.GEF:
        return CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.UKEF_APPROVED_WITHOUT_CONDITIONS;

      default:
        return null;
    }
  }

  if (tfmStatus === CONSTANTS.DEALS.DEAL_STAGE_TFM.DECLINED) {
    switch (dealType) {
      case CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS:
        return CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.UKEF_REFUSED;

      case CONSTANTS.DEALS.DEAL_TYPE.GEF:
        return CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.UKEF_REFUSED;

      default:
        return null;
    }
  }

  return null;
};

module.exports = mapTfmDealStageToPortalStatus;
