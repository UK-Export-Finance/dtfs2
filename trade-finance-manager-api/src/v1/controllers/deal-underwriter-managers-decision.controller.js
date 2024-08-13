const { getTime } = require('date-fns');
const { generateTfmAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const api = require('../api');
const CONSTANTS = require('../../constants');
const mapTfmDealStageToPortalStatus = require('../mappings/map-tfm-deal-stage-to-portal-status');
const sendDealDecisionEmail = require('./send-deal-decision-email');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');

const addUnderwriterManagersDecisionToDeal = ({ dealId, decision, comments, internalComments, userFullName, auditDetails }) => {
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
  return api.updateDeal({
    dealId,
    dealUpdate: managerDecisionUpdate,
    auditDetails,
    onError: (status, message) => {
      throw new Error(`Updating the deal with dealId ${dealId} failed with status ${status} and message: ${message}`);
    },
  });
};

const updatePortalDealStatusToMatchDecision = ({ dealId, dealType, decision, auditDetails }) => {
  const mappedPortalStatus = mapTfmDealStageToPortalStatus(decision);

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    return api.updatePortalBssDealStatus({ dealId, status: mappedPortalStatus, auditDetails });
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    return api.updatePortalGefDealStatus({ dealId, status: mappedPortalStatus, auditDetails });
  }

  return Promise.reject(new Error(`Unrecognised deal type ${dealType} for deal id ${dealId}.`));
};

const addUnderwriterManagersCommentToPortalDeal = ({ dealId, dealType, decision, comments, auditDetails }) => {
  const mappedPortalStatus = mapTfmDealStageToPortalStatus(decision);
  const portalCommentObj = {
    text: comments,
    decision: mappedPortalStatus,
  };

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    const portalCommentType =
      decision === CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITH_CONDITIONS || decision === CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITHOUT_CONDITIONS
        ? CONSTANTS.DEALS.DEAL_COMMENT_TYPE_PORTAL.UKEF_DECISION
        : CONSTANTS.DEALS.DEAL_COMMENT_TYPE_PORTAL.UKEF_COMMENT;
    return api.addPortalDealComment(dealId, portalCommentType, portalCommentObj, auditDetails);
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    const portalCommentType = CONSTANTS.DEALS.DEAL_COMMENT_TYPE_PORTAL.UKEF_DECISION;
    return api.addUnderwriterCommentToGefDeal(dealId, portalCommentType, portalCommentObj);
  }

  return Promise.reject(new Error(`Unrecognised deal type ${dealType} for deal id ${dealId}.`));
};

const extractDecisionFromRequest = (req) => {
  const {
    params: { dealId },
    body: { decision, comments, internalComments, userFullName },
  } = req;
  return {
    dealId,
    decision,
    comments,
    internalComments,
    userFullName,
  };
};

const updateUnderwriterManagersDecision = async (req, res) => {
  try {
    const { dealId, decision, comments, internalComments, userFullName } = extractDecisionFromRequest(req);
    const auditDetails = generateTfmAuditDetails(req.user._id);

    const updatedDeal = await addUnderwriterManagersDecisionToDeal({
      dealId,
      decision,
      comments,
      internalComments,
      userFullName,
      auditDetails,
    });
    const mappedDeal = mapSubmittedDeal(updatedDeal);
    const { dealType, submissionType } = mappedDeal;

    await updatePortalDealStatusToMatchDecision({ dealId, dealType, decision, auditDetails });
    await addUnderwriterManagersCommentToPortalDeal({ dealId, dealType, decision, comments, auditDetails });

    if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
      await sendDealDecisionEmail(mappedDeal);
    }

    return res.status(200).send();
  } catch (error) {
    console.error("Unable to update the underwriter manager's decision %o", error);
    return res.status(500).send({ data: "Unable to update the underwriter manager's decision" });
  }
};

module.exports = {
  updateUnderwriterManagersDecision,
};
