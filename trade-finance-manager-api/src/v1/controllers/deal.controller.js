const mapDeal = require('../mappings/map-deal');
const mapDeals = require('../mappings/map-deals');
const api = require('../api');
const acbsController = require('./acbs.controller');
const allPartiesHaveUrn = require('../helpers/all-parties-have-urn');
const CONSTANTS = require('../../constants');
const now = require('../../now');
const mapTfmDealStageToPortalStatus = require('../mappings/map-tfm-deal-stage-to-portal-status');
const sendDealDecisionEmail = require('./send-deal-decision-email');
const { assignGroupTasksToOneUser } = require('./tasks.controller');

const findOneTfmDeal = async (dealId) => {
  const deal = await api.findOneDeal(dealId).catch(() => false);

  if (!deal) {
    return false;
  }

  return {
    ...deal,
    dealSnapshot: await mapDeal(deal.dealSnapshot),
  };
};
exports.findOneTfmDeal = findOneTfmDeal;

const queryDeals = async (queryParams) => {
  const { deals } = await api.queryDeals({ ...queryParams });

  if (!deals) {
    return false;
  }

  return deals;
};

const findTfmDealsLight = async (queryParams) => {
  const deals = await queryDeals(queryParams);

  return {
    deals,
  };
};
exports.findTfmDealsLight = findTfmDealsLight;

const findTfmDeals = async (queryParams) => {
  const deals = await queryDeals(queryParams);

  const mapped = await mapDeals(deals);

  return {
    deals: mapped,
  };
};
exports.findTfmDeals = findTfmDeals;

const findOnePortalDeal = async (dealId) => {
  const deal = await api.findOnePortalDeal(dealId).catch(() => false);

  if (!deal) {
    return false;
  }

  return deal;
};
exports.findOnePortalDeal = findOnePortalDeal;

const findOneGefDeal = async (dealId) => {
  const deal = await api.findOneGefDeal(dealId).catch(() => false);

  if (!deal) {
    return false;
  }

  return deal;
};
exports.findOneGefDeal = findOneGefDeal;

const submitACBSIfAllPartiesHaveUrn = async (dealId) => {
  const deal = await findOneTfmDeal(dealId);

  if (!deal) {
    return;
  }

  /**
  1. GEF - Check whether the exporter has a URN
  2. BSS/ECWS - Check all the parties have a URN
  */
  const allRequiredPartiesHaveUrn = allPartiesHaveUrn(deal);

  if (allRequiredPartiesHaveUrn) {
    await acbsController.createACBS(deal);
  }
};
exports.submitACBSIfAllPartiesHaveUrn = submitACBSIfAllPartiesHaveUrn;

const updateTfmParty = async (dealId, tfmUpdate) => {
  const partyUpdate = {
    tfm: {
      parties: tfmUpdate,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, partyUpdate);

  await submitACBSIfAllPartiesHaveUrn(dealId);

  return updatedDeal.tfm;
};
exports.updateTfmParty = updateTfmParty;

const updateTfmCreditRating = async (dealId, exporterCreditRating) => {
  const creditRatingUpdate = {
    tfm: {
      exporterCreditRating,
    },
  };

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

const updateTfmProbabilityOfDefault = async (dealId, probabilityOfDefault) => {
  const probabilityOfDefaultUpdate = {
    tfm: {
      probabilityOfDefault,
    },
  };

  // eslint-disable-next-line no-underscore-dangle
  const updatedDeal = await api.updateDeal(dealId, probabilityOfDefaultUpdate);

  return updatedDeal.tfm;
};
exports.updateTfmProbabilityOfDefault = updateTfmProbabilityOfDefault;

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

  await api.updatePortalBssDealStatus(
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

  const { dealSnapshot } = updatedDeal;
  const { details } = dealSnapshot;
  const { submissionType } = details;

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    await sendDealDecisionEmail(updatedDeal);
  }

  return updatedDeal.tfm;
};
exports.updateTfmUnderwriterManagersDecision = updateTfmUnderwriterManagersDecision;

const updateTfmLeadUnderwriter = async (
  dealId,
  leadUnderwriter,
) => {
  const { userId } = leadUnderwriter;

  const leadUnderwriterUpdate = {
    tfm: {
      leadUnderwriter: userId,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, leadUnderwriterUpdate);

  const taskGroupsToUpdate = [
    CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE,
    CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE,
  ];

  await assignGroupTasksToOneUser(
    dealId,
    taskGroupsToUpdate,
    userId,
  );

  return updatedDeal.tfm;
};
exports.updateTfmLeadUnderwriter = updateTfmLeadUnderwriter;

const updateTfmActivityComment = async (dealId, commentUpdate) => {
  const updatedComment = {
    tfm: {
      activities: commentUpdate,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, updatedComment);

  return updatedDeal.tfm;
};
exports.updateTfmActivityComment = updateTfmActivityComment;
