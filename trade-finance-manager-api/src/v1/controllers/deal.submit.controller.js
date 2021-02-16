const { findOnePortalDeal } = require('./deal.controller');
const { addPartyUrns } = require('./deal.party-db');
const api = require('../api');

const submitDeal = async (dealId) => {
  const deal = await findOnePortalDeal(dealId);

  if (!deal) {
    return false;
  }

  const submittedDeal = await api.submitDeal(dealId);
  const updatedDealWithPartyUrn = await addPartyUrns(submittedDeal);
  return api.updateDeal(dealId, updatedDealWithPartyUrn);
};

exports.submitDeal = submitDeal;

const submitDealPUT = async (req, res) => {
  const { dealId } = req.body;

  const dealInit = await submitDeal(dealId);

  if (!dealInit) {
    return res.status(404).send();
  }

  return res.status(200).send(dealInit);
};
exports.submitDealPUT = submitDealPUT;
