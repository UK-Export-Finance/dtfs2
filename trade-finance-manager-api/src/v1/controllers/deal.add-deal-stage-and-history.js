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
      history: DEFAULTS.HISTORY,
    },
  };

  let tfmDealStage;

  if (status === CONSTANTS.DEALS.DEAL_STATUS_PORTAL.SUBMITTED) {
    if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
      tfmDealStage = CONSTANTS.DEALS.DEAL_STAGE_TFM.CONFIRMED;
    }

    if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      tfmDealStage = CONSTANTS.DEALS.DEAL_STAGE_TFM.APPLICATION;
    }
  }

  dealUpdate = {
    tfm: {
      ...tfm,
      ...dealUpdate.tfm,
      stage: tfmDealStage,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, dealUpdate);

  return updatedDeal;
};

exports.addDealStageAndHistory = addDealStageAndHistory;
