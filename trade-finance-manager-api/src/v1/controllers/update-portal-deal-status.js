const api = require('../api');
const CONSTANTS = require('../../constants');

const updatePortalDealStatus = async (dealId, submissionType, statusUpdate) => {
  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
    || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    await api.updatePortalDealStatus(
      dealId,
      statusUpdate,
    );
  }
  return null;
};

exports.updatePortalDealStatus = updatePortalDealStatus;
