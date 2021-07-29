const {
  findOneTfmDeal,
  findOnePortalDeal,
  findOneGefDeal,
} = require('./deal.controller');
const { addPartyUrns } = require('./deal.party-db');
const { createDealTasks } = require('./deal.tasks');
const { updateFacilities } = require('./update-facilities');
const { addDealProduct } = require('./deal.add-product');
const { addDealPricingAndRisk } = require('./deal.pricing-and-risk');
const { convertDealCurrencies } = require('./deal.convert-deal-currencies');
const { addDealStageAndHistory } = require('./deal.add-deal-stage-and-history');
const { addDealDateReceived } = require('./deal.add-date-received');
const { updatedIssuedFacilities } = require('./update-issued-facilities');
const { updatePortalDealStatus } = require('./update-portal-deal-status');
const CONSTANTS = require('../../constants');
const api = require('../api');
const { createEstoreFolders } = require('./estore.controller');
const acbsController = require('./acbs.controller');
const dealController = require('./deal.controller');
const { shouldUpdateDealFromMIAtoMIN } = require('./should-update-deal-from-MIA-to-MIN');
const { updatePortalDealFromMIAtoMIN } = require('./update-portal-deal-from-MIA-to-MIN');
const { sendDealSubmitEmails, sendAinMinIssuedFacilitiesAcknowledgementByDealId } = require('./send-deal-submit-emails');

// TODO: move mappings outside of graphql directory
// const mapDealSnapshot = require('../../graphql/reducers/mappings/deal/mapDealSnapshot');
// const mapGefDealSnapshot = require('../../graphql/reducers/mappings/gef-deal/mapGefDealSnapshot');

const getDeal = async (dealId, dealType) => {
  let deal;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    deal = await findOneGefDeal(dealId);

    // temporarily return false for dev.
    return false;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    deal = await findOnePortalDeal(dealId);
  }

  return deal;
};

/*
const mapDeal = (deal) => {
  let mappedDeal;

  const { dealType } = deal.dealSnapshot;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    mappedDeal = mapGefDealSnapshot(deal);

    // temporarily return false for dev.
    return false;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    mappedDeal = mapDealSnapshot(deal);
  }

  return mappedDeal;
};
*/

const submitDeal = async (dealId, dealType, checker) => {
  const deal = await getDeal(dealId, dealType);

  if (!deal) {
    return false;
  }


  // TODO:
  // 1) use mapDeal (and maybe dealReducer functionality??) to bring both deal types into nice data shape.
  // 2) update variable names in functions below. Simpler, cleaner. One step closer to unified structure.
  // 3) extract 'mappings' so it's outside of graphql as it won't be GQL specific

  const submittedDeal = await api.submitDeal(dealId);

  // const mappedDeal = mapDeal(submittedDeal);

  const { submissionCount } = deal.details;

  const firstDealSubmission = submissionCount === 1;
  const dealHasBeenResubmit = submissionCount > 1;


  if (firstDealSubmission) {
    await updatePortalDealStatus(deal);

    const updatedDealWithPartyUrn = await addPartyUrns(submittedDeal);

    const updatedDealWithProduct = await addDealProduct(updatedDealWithPartyUrn);

    const updatedDealWithPricingAndRisk = await addDealPricingAndRisk(updatedDealWithProduct);

    const updatedDealWithDealCurrencyConversions = await convertDealCurrencies(updatedDealWithPricingAndRisk);

    const updatedDealWithTfmDealStage = await addDealStageAndHistory(updatedDealWithDealCurrencyConversions);

    const updatedDealWithTfmDateReceived = await addDealDateReceived(updatedDealWithTfmDealStage);

    const updatedDealWithUpdatedFacilities = await updateFacilities(updatedDealWithTfmDateReceived);

    const updatedDealWithCreateEstore = await createEstoreFolders(updatedDealWithUpdatedFacilities);

    if (deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      const updatedDealWithTasks = await createDealTasks(updatedDealWithCreateEstore);

      const updatedDeal = await api.updateDeal(dealId, updatedDealWithTasks);
      await sendDealSubmitEmails(dealId);

      return updatedDeal;
    }

    return api.updateDeal(dealId, updatedDealWithCreateEstore);
  }

  if (dealHasBeenResubmit) {
    const { tfm: tfmDeal } = await findOneTfmDeal(dealId);

    const updatedDeal = await updatedIssuedFacilities(submittedDeal);

    if (deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN
      || deal.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN
    ) {
      await acbsController.issueAcbsFacilities(updatedDeal);
    }

    if (shouldUpdateDealFromMIAtoMIN(deal, tfmDeal)) {
      const portalMINUpdate = await updatePortalDealFromMIAtoMIN(dealId, checker);

      const { dealSnapshot } = await api.updateDealSnapshot(dealId, portalMINUpdate);

      await dealController.submitACBSIfAllPartiesHaveUrn(dealId);

      await sendAinMinIssuedFacilitiesAcknowledgementByDealId(dealId);

      updatedDeal.dealSnapshot = dealSnapshot;
    }

    await updatePortalDealStatus(updatedDeal.dealSnapshot);

    return api.updateDeal(dealId, updatedDeal);
  }

  return api.updateDeal(dealId, submittedDeal);
};

exports.submitDeal = submitDeal;

const submitDealPUT = async (req, res) => {
  const {
    dealId,
    dealType,
    checker,
  } = req.body;

  const deal = await submitDeal(dealId, dealType, checker);

  if (!deal) {
    return res.status(404).send();
  }

  return res.status(200).send(deal);
};
exports.submitDealPUT = submitDealPUT;
