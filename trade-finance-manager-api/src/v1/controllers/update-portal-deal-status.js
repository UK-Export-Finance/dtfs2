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
      newStatus = CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.SUBMISSION_ACKNOWLEDGED;

      await api.updatePortalDealStatus(dealId, newStatus);
    }

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      newStatus = CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.UKEF_ACKNOWLEDGED;

      await api.updateGefDealStatus(dealId, newStatus);
    }
  }

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      newStatus = CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.IN_PROGRESS;

      await api.updatePortalDealStatus(dealId, newStatus);
    }

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      newStatus = CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.UKEF_IN_PROGRESS;
      await api.updateGefDealStatus(dealId, newStatus);
    }
  }
  return deal;
};

exports.updatePortalDealStatus = updatePortalDealStatus;
