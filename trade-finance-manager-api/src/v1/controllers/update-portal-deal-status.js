const api = require('../api');
const CONSTANTS = require('../../constants');

const updatePortalDealStatus = async (deal) => {
  const updatedDeal = deal;

  const { _id: dealId } = updatedDeal;
  const { submissionType } = deal.details;

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

  if (newStatus) {
    updatedDeal.details.status = newStatus;
  }

  return updatedDeal;
};

exports.updatePortalDealStatus = updatePortalDealStatus;
