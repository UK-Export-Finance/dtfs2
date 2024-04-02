const api = require('../api');
const CONSTANTS = require('../../constants');

/**
 * Updates the status of a deal in a portal.
 * @param {object} deal - The deal object containing properties `_id`, `dealType`, and `submissionType`.
 * @returns {Promise<object>} - The updated deal object.
 */
const updatePortalDealStatus = async (deal) => {
  const { _id, dealType, submissionType } = deal;
  const noticeSubmissionType = [CONSTANTS.DEALS.SUBMISSION_TYPE.AIN, CONSTANTS.DEALS.SUBMISSION_TYPE.MIN];
  const applicationSubmissionType = [CONSTANTS.DEALS.SUBMISSION_TYPE.MIA];

  let status;

  // Deal is an application (MIA)
  if (applicationSubmissionType.includes(submissionType)) {
    status = CONSTANTS.DEALS.PORTAL_DEAL_STATUS.IN_PROGRESS_BY_UKEF;
  }

  // Deal is a notice (AIN, MIN)
  if (noticeSubmissionType.includes(submissionType)) {
    status = CONSTANTS.DEALS.PORTAL_DEAL_STATUS.UKEF_ACKNOWLEDGED;
  }

  if (!status) {
    console.error('Cannot update portal deal %s status for submission type %s', _id, submissionType);
    return deal;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    await api.updatePortalBssDealStatus(_id, status);
  } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    await api.updatePortalGefDealStatus(_id, status);
  }

  return deal;
};

exports.updatePortalDealStatus = updatePortalDealStatus;
