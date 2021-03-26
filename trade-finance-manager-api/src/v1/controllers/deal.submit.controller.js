const { findOnePortalDeal } = require('./deal.controller');
const { addPartyUrns } = require('./deal.party-db');
const { createDealTasks } = require('./deal.tasks');
const { updateFacilities } = require('./update-facilities');
const { addDealRiskRating } = require('./deal.risk-rating');
const { convertDealCurrencies } = require('./deal.convert-deal-currencies');
const CONSTANTS = require('../../constants');
const api = require('../api');

const submitDeal = async (dealId) => {
  const deal = await findOnePortalDeal(dealId);

  if (!deal) {
    return false;
  }

  const submittedDeal = await api.submitDeal(dealId);

  const updatedDealWithPartyUrn = await addPartyUrns(submittedDeal);

  const updatedDealWithTasks = await createDealTasks(updatedDealWithPartyUrn);

  const updatedDealWithRiskRating = await addDealRiskRating(updatedDealWithTasks);

  const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithRiskRating);

  const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithDealCurrencyConversions);

  if (deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    await api.updatePortalDealStatus(
      dealId,
      CONSTANTS.DEALS.DEAL_STATUS.SUBMISSION_ACKNOWLEDGED,
    );
  }

  return api.updateDeal(dealId, updatedDealWithUpdatedFacilities);
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
