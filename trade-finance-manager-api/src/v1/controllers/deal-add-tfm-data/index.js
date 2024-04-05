const api = require('../../api');
const generateDateReceived = require('./dateReceived');
const addDealProduct = require('./dealProduct');
const addDealPricingAndRisk = require('./dealPricingAndRisk');
const addDealStage = require('./dealStage');

const addTfmDealData = async (deal, sessionUser) => {
  if (!deal) {
    console.error('Unable to add TFM object to deal %s', deal._id);
    return false;
  }

  const {
    _id: dealId,
    submissionType,
    status,
    tfm,
  } = deal;

  const dealUpdate = {
    tfm: {
      ...tfm,
      ...generateDateReceived(),
      parties: {},
      activities: [],
      product: addDealProduct(deal),
      stage: addDealStage(status, submissionType),
      ...addDealPricingAndRisk(deal),
    },
  };

  const updatedDeal = await api.updateDeal(dealId, dealUpdate, sessionUser);

  return {
    ...deal,
    tfm: updatedDeal.tfm,
  };
};

module.exports = addTfmDealData;
