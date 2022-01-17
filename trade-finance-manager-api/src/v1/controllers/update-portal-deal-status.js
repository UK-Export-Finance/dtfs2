const api = require('../api');
const CONSTANTS = require('../../constants');

const updatePortalDealStatus = async (deal) => {
  const {
    _id: dealId,
    dealType,
    submissionType,
  } = deal;

  let newStatus;

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
    || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN) {
    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      newStatus = CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.UKEF_ACKNOWLEDGED;

      await api.updatePortalBssDealStatus(dealId, newStatus);
    }

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      newStatus = CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.UKEF_ACKNOWLEDGED;

      await api.updatePortalGefDealStatus(dealId, newStatus);
    }
  }

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      newStatus = CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.IN_PROGRESS;

      await api.updatePortalBssDealStatus(dealId, newStatus);
    }

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      newStatus = CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.IN_PROGRESS_BY_UKEF;
      await api.updatePortalGefDealStatus(dealId, newStatus);
    }
  }

  return deal;
};

exports.updatePortalDealStatus = updatePortalDealStatus;
