const api = require('../api');
const CONSTANTS = require('../../constants');

const updatePortalDealStatus = async (deal) => {
  const {
    _id: dealId,
    dealType,
    submissionType,
  } = deal;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    let newStatus;

    if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
      newStatus = CONSTANTS.DEALS.DEAL_STATUS_PORTAL.SUBMISSION_ACKNOWLEDGED;

      await api.updatePortalDealStatus(
        dealId,
        newStatus,
      );
    }

    if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      newStatus = CONSTANTS.DEALS.DEAL_STATUS_PORTAL.IN_PROGRESS;

      await api.updatePortalDealStatus(
        dealId,
        newStatus,
      );
    }

    if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN) {
      newStatus = CONSTANTS.DEALS.DEAL_STATUS_PORTAL.SUBMISSION_ACKNOWLEDGED;

      await api.updatePortalDealStatus(
        dealId,
        newStatus,
      );
    }
  }

  return deal;
};

exports.updatePortalDealStatus = updatePortalDealStatus;
