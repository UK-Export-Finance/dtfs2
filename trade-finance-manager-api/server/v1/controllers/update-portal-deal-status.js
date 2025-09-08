const api = require('../api');
const CONSTANTS = require('../../constants');

/**
 * Updates the status of a deal in a portal.
 * @param {object} deal - The deal object containing properties `_id`, `dealType`, and `submissionType`.
 * @returns {Promise<object>} - The updated deal object.
 */
const updatePortalDealStatus = async (deal, auditDetails) => {
  const { _id, dealType, submissionType } = deal;
  const noticeSubmissionType = [CONSTANTS.DEALS.SUBMISSION_TYPE.AIN, CONSTANTS.DEALS.SUBMISSION_TYPE.MIN];
  const applicationSubmissionType = [CONSTANTS.DEALS.SUBMISSION_TYPE.MIA];

  let status;

  console.info('Updating portal deal %s status with submission type %s.', _id, submissionType);

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
    await api.updatePortalBssDealStatus({ dealId: _id, status, auditDetails });
  } else if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    await api.updatePortalGefDealStatus({ dealId: _id, status, auditDetails });
  }

  return deal;
};

exports.updatePortalDealStatus = updatePortalDealStatus;
