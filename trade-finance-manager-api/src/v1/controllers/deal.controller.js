const mapDeal = require('../mappings/map-deal');
const api = require('../api');
const acbsController = require('./acbs.controller');
const allPartiesHaveUrn = require('../helpers/all-parties-have-urn');
const CONSTANTS = require('../../constants');
const now = require('../../now');
const mapTfmDealStageToPortalStatus = require('../mappings/map-tfm-deal-stage-to-portal-status');

const findOneDeal = async (dealId) => {
  const deal = await api.findOneDeal(dealId).catch(() => false);

  if (!deal) {
    return false;
  }

  return {
    ...deal,
    dealSnapshot: await mapDeal(deal.dealSnapshot),
  };
};
exports.findOneDeal = findOneDeal;

const findOnePortalDeal = async (dealId) => {
  const deal = await api.findOnePortalDeal(dealId).catch(() => false);

  if (!deal) {
    return false;
  }

  return deal;
};
exports.findOnePortalDeal = findOnePortalDeal;

const submitIfAllPartiesHaveUrn = async (dealId) => {
  const deal = await findOneDeal(dealId);
  if (!deal) {
    return;
  }
  const allRequiredPartiesHaveUrn = allPartiesHaveUrn(deal);
  // Only want to submit AIN deals to ACBS initially
  if (allRequiredPartiesHaveUrn
    && deal.dealSnapshot.details.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    // Start ACBS process
    await acbsController.createACBS(deal);
  }
};
exports.submitIfAllPartiesHaveUrn = submitIfAllPartiesHaveUrn;

const updateTfmParty = async (dealId, tfmUpdate) => {
  const partyUpdate = {
    tfm: {
      parties: tfmUpdate,
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await api.updateDeal(dealId, partyUpdate);

  await submitIfAllPartiesHaveUrn(dealId);

  return updatedDeal.tfm;
};
exports.updateTfmParty = updateTfmParty;

const updateTfmCreditRating = async (dealId, exporterCreditRating) => {
  const creditRatingUpdate = {
    tfm: {
      exporterCreditRating,
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await api.updateDeal(dealId, creditRatingUpdate);

  return updatedDeal.tfm;
};
exports.updateTfmCreditRating = updateTfmCreditRating;

const updateTfmLossGivenDefault = async (dealId, lossGivenDefault) => {
  const lossGivenDefaultUpdate = {
    tfm: {
      lossGivenDefault,
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await api.updateDeal(dealId, lossGivenDefaultUpdate);

  return updatedDeal.tfm;
};
exports.updateTfmLossGivenDefault = updateTfmLossGivenDefault;

const updateTfmUnderwriterManagersDecision = async (
  dealId,
  decision,
  comments,
  internalComments,
  userFullName,
) => {
  const managerDecisionUpdate = {
    tfm: {
      underwriterManagersDecision: {
        decision,
        comments,
        internalComments,
        userFullName,
        timestamp: now(),
      },
      stage: decision,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, managerDecisionUpdate);

  const newPortalStatus = mapTfmDealStageToPortalStatus(decision);

  await api.updatePortalDealStatus(
    dealId,
    newPortalStatus,
  );

  let portalCommentType = CONSTANTS.DEALS.DEAL_COMMENT_TYPE_PORTAL.UKEF_COMMENT;

  if (decision === CONSTANTS.DEALS.DEAL_STAGE_TFM.APPROVED_WITH_CONDITIONS) {
    portalCommentType = CONSTANTS.DEALS.DEAL_COMMENT_TYPE_PORTAL.SPECIAL_CONDITIONS;
  }

  const portalCommentObj = {
    text: comments,
  };

  api.addPortalDealComment(
    dealId,
    portalCommentType,
    portalCommentObj,
  );

  return updatedDeal.tfm;
};
exports.updateTfmUnderwriterManagersDecision = updateTfmUnderwriterManagersDecision;
