const { getTime } = require('date-fns');
const api = require('../api');
const CONSTANTS = require('../../constants');
const mapTfmDealStageToPortalStatus = require('../mappings/map-tfm-deal-stage-to-portal-status');
const sendDealDecisionEmail = require('./send-deal-decision-email');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');

const addUnderwriterManagersDecisionToDeal = ({
  dealId,
  decision,
  comments,
  internalComments,
  userFullName
}) => {
  const managerDecisionUpdate = {
    tfm: {
      underwriterManagersDecision: {
        decision,
        comments,
        internalComments,
        userFullName,
        timestamp: getTime(new Date()),
      },
      stage: decision,
    },
  };
  return api.updateDeal(dealId, managerDecisionUpdate);
};

const updatePortalDealStatusToMatchDecision = ({
  dealId,
  dealType,
  decision,
}) => {
  const mappedPortalStatus = mapTfmDealStageToPortalStatus(decision);

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    return api.updatePortalBssDealStatus(dealId, mappedPortalStatus);
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    return api.updatePortalGefDealStatus(dealId, mappedPortalStatus);
  }

  return Promise.reject(new Error(`Unrecognised deal type ${dealType} for deal id ${dealId}.`));
};

const addUnderwriterManagersCommentToPortalDeal = ({
  dealId,
  dealType,
  decision,
  comments,
}) => {
  const mappedPortalStatus = mapTfmDealStageToPortalStatus(decision);
  const portalCommentObj = {
    text: comments,
    decision: mappedPortalStatus,
  };

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    const portalCommentType = (
      decision === CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITH_CONDITIONS
      || decision === CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITHOUT_CONDITIONS
    ) ? CONSTANTS.DEALS.DEAL_COMMENT_TYPE_PORTAL.UKEF_DECISION
      : CONSTANTS.DEALS.DEAL_COMMENT_TYPE_PORTAL.UKEF_COMMENT;
    return api.addPortalDealComment(dealId, portalCommentType, portalCommentObj);
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    const portalCommentType = CONSTANTS.DEALS.DEAL_COMMENT_TYPE_PORTAL.UKEF_DECISION;
    return api.addUnderwriterCommentToGefDeal(dealId, portalCommentType, portalCommentObj);
  }

  return Promise.reject(new Error(`Unrecognised deal type ${dealType} for deal id ${dealId}.`));
};

const updateUnderwriterManagersDecision = async ({
  dealId,
  decision,
  comments,
  internalComments,
  userFullName
}) => {
  const updatedDeal = await addUnderwriterManagersDecisionToDeal({ dealId, decision, comments, internalComments, userFullName });

  const mappedDeal = mapSubmittedDeal(updatedDeal);
  const { dealType, submissionType } = mappedDeal;

  await updatePortalDealStatusToMatchDecision({ dealId, dealType, decision });
  await addUnderwriterManagersCommentToPortalDeal({ dealId, dealType, decision, comments });

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    await sendDealDecisionEmail(mappedDeal);
  }

  return updatedDeal.tfm;
};

module.exports = {
  updateUnderwriterManagersDecision,
};
