const { findOneDeal } = require('./deal.controller');
const { addPartyUrns } = require('./deal.party-db');
const api = require('../api');

const submitDeal = async (dealId) => {
  const deal = await findOneDeal(dealId);
  console.log(`Submit deal to tfm id: ${dealId}`);
  if (!deal) {
    return false;
  }

  const updatedDealWithPartyUrn = await addPartyUrns(deal);
  return api.updateDeal(dealId, updatedDealWithPartyUrn);
};

exports.submitDeal = submitDeal;

const submitDealGET = async (req, res) => {
  const { dealId } = req.params;

  const dealInit = await submitDeal(dealId);

  if (!dealInit) {
    return res.status(404).send();
  }

  return res.status(200).send(dealInit);
};
exports.submitDealGET = submitDealGET;
