const api = require('../../api');
const generateDateReceived = require('./dateReceived');
const addDealProduct = require('./dealProduct');
const addDealPricingAndRisk = require('./dealPricingAndRisk');
const addDealStage = require('./dealStage');

const addTfmDealData = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    _id: dealId,
    submissionType,
    submissionDate,
    created,
    status,
    tfm,
  } = deal;

  const dealUpdate = {
    tfm: {
      ...tfm,
      ...generateDateReceived(submissionDate || created),
      parties: {},
      activities: [],
      product: addDealProduct(deal),
      stage: addDealStage(status, submissionType),
      ...addDealPricingAndRisk(deal),
    },
  };

  const updatedDeal = await api.updateDeal(dealId, dealUpdate);

  return {
    ...deal,
    tfm: updatedDeal.tfm,
  };
};

module.exports = addTfmDealData;
