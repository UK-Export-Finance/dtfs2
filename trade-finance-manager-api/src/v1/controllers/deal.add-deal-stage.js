const api = require('../api');
const CONSTANTS = require('../../constants');

const addDealStage = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    tfm,
    dealSnapshot,
  } = deal;

  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    details,
  } = dealSnapshot;

  const {
    submissionType,
    status,
  } = details;

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
    && status === CONSTANTS.DEALS.DEAL_STATUS_PORTAL.SUBMITTED) {
    const dealUpdate = {
      tfm: {
        ...tfm,
        stage: CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED,
      },
    };

    const updatedDeal = await api.updateDeal(dealId, dealUpdate);

    return updatedDeal;
  }

  return deal;
};

exports.addDealStage = addDealStage;
