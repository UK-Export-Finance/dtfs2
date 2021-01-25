const { findOneDeal } = require('./deal.controller');
const { addPartyURN } = require('./deal.party-db');
const api = require('../api');

const submitDeal = async (dealId) => {
  const deal = await findOneDeal(dealId);

  if (!deal) {
    return false;
  }

  const updatedDealWithPartyUrn = await addPartyURN(deal);
  if (updatedDealWithPartyUrn) {
    return api.updateDeal(dealId, updatedDealWithPartyUrn);
  }

  return false;
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
