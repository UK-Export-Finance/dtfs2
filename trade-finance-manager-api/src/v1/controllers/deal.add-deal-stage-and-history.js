const api = require('../api');
const DEFAULTS = require('../defaults');
const CONSTANTS = require('../../constants');

const addDealStageAndHistory = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    submissionType,
    status,
    tfm,
  } = deal;

  let dealUpdate = {
    tfm: {
      ...tfm,
      history: DEFAULTS.HISTORY,
    },
  };

  let tfmDealStage;

  const hasSubmittedStatus = (status === CONSTANTS.DEALS.DEAL_STATUS_PORTAL_BSS.SUBMITTED
    || status === CONSTANTS.DEALS.DEAL_STATUS_PORTAL_GEF.SUBMITTED);

  if (hasSubmittedStatus) {
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

  return {
    ...deal,
    tfm: updatedDeal.tfm,
  };
};

exports.addDealStageAndHistory = addDealStageAndHistory;
