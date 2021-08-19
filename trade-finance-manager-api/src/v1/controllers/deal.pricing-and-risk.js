const api = require('../api');
const CONSTANTS = require('../../constants');
const DEFAULTS = require('../defaults');

const addDealPricingAndRisk = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    dealType,
    submissionType,
    exporter,
    tfm,
  } = deal;

  // TODO:
  // lossGivenDefault should be integers without text/percentage symbol.
  // but, don't know what the data could change to post-MVP so just use strings for MVP requirement.
  const dealUpdate = {
    tfm: {
      ...tfm,
      lossGivenDefault: DEFAULTS.LOSS_GIVEN_DEFAULT,
    },
  };

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    dealUpdate.tfm.exporterCreditRating = DEFAULTS.CREDIT_RATING.AIN;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    dealUpdate.tfm.probabilityOfDefault = exporter.probabilityOfDefault;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    dealUpdate.tfm.probabilityOfDefault = DEFAULTS.PROBABILITY_OF_DEFAULT;
  }

  const updatedDeal = await api.updateDeal(dealId, dealUpdate);

  return {
    ...deal,
    tfm: updatedDeal.tfm,
  };
};

exports.addDealPricingAndRisk = addDealPricingAndRisk;
