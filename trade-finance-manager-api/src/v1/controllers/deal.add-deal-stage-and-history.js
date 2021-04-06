const api = require('../api');
const DEFAULTS = require('../defaults');
const CONSTANTS = require('../../constants');

const addDealStageAndHistory = async (deal) => {
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

  let dealUpdate = {
    tfm: {
      ...tfm,
      history: DEFAULTS.DEALS.HISTORY,
    },
  };

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
    && status === CONSTANTS.DEALS.DEAL_STATUS_PORTAL.SUBMITTED) {
    dealUpdate = {
      tfm: {
        ...tfm,
        ...dealUpdate.tfm,
        stage: CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED,
      },
    };
  }

  const updatedDeal = await api.updateDeal(dealId, dealUpdate);

  return updatedDeal;
};

exports.addDealStageAndHistory = addDealStageAndHistory;
