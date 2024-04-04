const api = require('../../api');
const generateDateReceived = require('./dateReceived');
const addDealProduct = require('./dealProduct');
const addDealPricingAndRisk = require('./dealPricingAndRisk');
const addDealStage = require('./dealStage');
const { generatePortalUserInformation } = require("../../helpers/generateUserInformation");

const addTfmDealData = async (deal, sessionPortalUser) => {
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

  const updatedDeal = await api.updateDeal({ dealId, dealUpdate, userInformation: generatePortalUserInformation(sessionPortalUser._id) });

  return {
    ...deal,
    tfm: updatedDeal.tfm,
  };
};

module.exports = addTfmDealData;
