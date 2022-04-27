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
    newStatus = CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED;
    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      await api.updatePortalBssDealStatus(dealId, newStatus);
    }

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      await api.updatePortalGefDealStatus(dealId, newStatus);
    }
  }

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    newStatus = CONSTANTS.DEALS.PORTAL_DEAL_STATUS.IN_PROGRESS_BY_UKEF;
    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
      await api.updatePortalBssDealStatus(dealId, newStatus);
    }

    if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
      await api.updatePortalGefDealStatus(dealId, newStatus);
    }
  }

  return deal;
};

exports.updatePortalDealStatus = updatePortalDealStatus;
