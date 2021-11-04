const api = require('../../api');
const { dateReceived: addDateReceived } = require('./dateReceived');
const addDealProduct = require('./dealProduct');
const addDealPricingAndRisk = require('./dealPricingAndRisk');
const addDealStage = require('./dealStage');
const DEFAULTS = require('../../defaults');

const addTfmDealData = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    _id: dealId,
    submissionDate,
    submissionType,
    status,
    tfm,
  } = deal;

  const dealUpdate = {
    tfm: {
      ...tfm,
      dateReceived: addDateReceived(submissionDate),
      history: DEFAULTS.HISTORY,
      parties: {},
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
