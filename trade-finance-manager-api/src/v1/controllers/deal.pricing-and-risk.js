const api = require('../api');
const CONSTANTS = require('../../constants');
const DEFAULTS = require('../defaults');

const addDealPricingAndRisk = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    submissionType,
    tfm,
  } = deal;

  // TODO:
  // lossGivenDefault and probabilityOfDefault should be integers without text/percentage symbol.
  // but, don't know what the data could change to post-MVP so just use strings for MVP requirement.
  let dealUpdate = {
    tfm: {
      lossGivenDefault: DEFAULTS.LOSS_GIVEN_DEFAULT,
      probabilityOfDefault: DEFAULTS.PROBABILITY_OF_DEFAULT,
    },
  };

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    dealUpdate = {
      tfm: {
        ...tfm,
        ...dealUpdate.tfm,
        exporterCreditRating: DEFAULTS.CREDIT_RATING.AIN,
      },
    };
  }

  const updatedDeal = await api.updateDeal(dealId, dealUpdate);

  return {
    ...deal,
    tfm: updatedDeal.tfm,
  };
};

exports.addDealPricingAndRisk = addDealPricingAndRisk;
