const api = require('../api');
const CONSTANTS = require('../../constants');
const DEFAULTS = require('../defaults');

const addDealPricingAndRisk = async (deal) => {
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

  const { submissionType } = details;

  // TODO: wrap pricing-risk things into object?

  let dealUpdate = {
    tfm: {
      lossGivenDefault: DEFAULTS.LOSS_GIVEN_DEFAULT,
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

  return updatedDeal;
};

exports.addDealPricingAndRisk = addDealPricingAndRisk;
