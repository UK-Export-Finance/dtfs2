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

<<<<<<< HEAD
  // 02/11 added array to store activities including comments
=======
>>>>>>> 51113d6cd4c106d6e70f1887adf182b180f8a309
  const dealUpdate = {
    tfm: {
      ...tfm,
      dateReceived: addDateReceived(submissionDate),
      history: DEFAULTS.HISTORY,
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
