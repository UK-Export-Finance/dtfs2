const { getTime } = require('date-fns');
const mapDeal = require('../mappings/map-deal');
const mapDeals = require('../mappings/map-deals');
const api = require('../api');
const acbsController = require('./acbs.controller');
const allPartiesHaveUrn = require('../helpers/all-parties-have-urn');
const CONSTANTS = require('../../constants');
const mapTfmDealStageToPortalStatus = require('../mappings/map-tfm-deal-stage-to-portal-status');
const sendDealDecisionEmail = require('./send-deal-decision-email');
const assignGroupTasksToOneUser = require('../tasks/assign-group-tasks-to-one-user');
const mapSubmittedDeal = require('../mappings/map-submitted-deal');
const dealReducer = require('../graphql-mappings/deal');
const { dealsLightReducer } = require('../graphql-mappings/deals-light');
const { filterTasks } = require('../graphql-mappings/filters/filterTasks');
const { filterActivities } = require('../graphql-mappings/filters/filterActivities');

const getDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { tasksFilters, activityFilters } = req.body;

    const deal = await api.findOneDeal(dealId);

    if (!deal) {
      return res.status(404).send();
    }

    const dealWithMappedSnapshot = {
      ...deal,
      dealSnapshot: await mapDeal(deal.dealSnapshot),
    };

    const filteredDeal = {
      ...dealWithMappedSnapshot,
      tfm: {
        ...deal.tfm,
        tasks: filterTasks(deal.tfm.tasks, tasksFilters),
        activities: filterActivities(deal.tfm.activities, activityFilters),
      },
    };

    const reducedDeal = dealReducer(filteredDeal);

    return res.status(200).send(reducedDeal);
  } catch (err) {
    console.error('Unable to get deal: %O', err);
    return res.status(400).send({ data: 'Unable to get deal' });
  }
};
exports.getDeal = getDeal;

const getDeals = async (req, res) => {
  try {
    const queryParams = req.query;
    const { deals } = await api.queryDeals({ queryParams });
    const reducedDeals = dealsLightReducer(deals);
    return res.status(200).send(reducedDeals);
  } catch (err) {
    console.error(`Error fetching deals: ${err}`);
    return res.status(500).send(err.message);
  }
};
exports.getDeals = getDeals;

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
  const { deals } = await api.queryDeals({ queryParams });

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

const updateDeal = async (req, res) => {
  const { dealId } = req.params;
  const dealUpdate = req.body;
  try {
    const updatedDeal = await api.updateDeal(dealId, dealUpdate);
    return res.status(200).send({
      updateDeal: updatedDeal.tfm,
    });
  } catch (error) {
    console.error('Unable to update deal: %O', error);
    return res.status(400).send({ data: 'Unable to update deal' });
  }
};
exports.updateDeal = updateDeal;

const submitACBSIfAllPartiesHaveUrn = async (dealId) => {
  const deal = await findOneTfmDeal(dealId);

  if (!deal) {
    return;
  }

  /**
  1. GEF - Check whether the exporter has a URN
  2. BSS/EWCS - Check all the parties have a URN
  */
  const allRequiredPartiesHaveUrn = allPartiesHaveUrn(deal);

  if (allRequiredPartiesHaveUrn) {
    await acbsController.createACBS(deal);
  }
};
exports.submitACBSIfAllPartiesHaveUrn = submitACBSIfAllPartiesHaveUrn;

const canDealBeSubmittedToACBS = (submissionType) => {
  const acceptable = [CONSTANTS.DEALS.SUBMISSION_TYPE.AIN, CONSTANTS.DEALS.SUBMISSION_TYPE.MIN];
  return acceptable.includes(submissionType);
};
exports.canDealBeSubmittedToACBS = canDealBeSubmittedToACBS;

const updateTfmParty = async (dealId, tfmUpdate) => {
  const partyUpdate = {
    tfm: {
      parties: tfmUpdate,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, partyUpdate);

  if (updatedDeal.dealSnapshot) {
    if (canDealBeSubmittedToACBS(updatedDeal.dealSnapshot.submissionType)) {
      await submitACBSIfAllPartiesHaveUrn(dealId);
    }
  }

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

  const updatedDeal = await api.updateDeal(dealId, probabilityOfDefaultUpdate);

  return updatedDeal.tfm;
};
exports.updateTfmProbabilityOfDefault = updateTfmProbabilityOfDefault;

const updateTfmUnderwriterManagersDecision = async (dealId, decision, comments, internalComments, userFullName) => {
  // Add Manager's decision to the deal (this gets updated in tfm-deals collection)
  // note: GEF and BSS deals follow the same format
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

  const updatedDeal = await api.updateDeal(dealId, managerDecisionUpdate);

  const mappedDeal = mapSubmittedDeal(updatedDeal);

  const { dealType, submissionType } = mappedDeal;

  const mappedPortalStatus = mapTfmDealStageToPortalStatus(decision);

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    await api.updatePortalBssDealStatus(dealId, mappedPortalStatus);
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    await api.updatePortalGefDealStatus(dealId, mappedPortalStatus);
  }

  let portalCommentType = CONSTANTS.DEALS.DEAL_COMMENT_TYPE_PORTAL.UKEF_COMMENT;

  if (
    decision === CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITH_CONDITIONS
    || decision === CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITHOUT_CONDITIONS
  ) {
    portalCommentType = CONSTANTS.DEALS.DEAL_COMMENT_TYPE_PORTAL.UKEF_DECISION;
  }

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) {
    const portalCommentObj = {
      text: comments,
      decision: mappedPortalStatus,
    };
    await api.addPortalDealComment(dealId, portalCommentType, portalCommentObj);
  }

  /**
   * If it's a GEF deal, update the deal in deals collection to include the ukefDecision.
   * decision - Refers to mappedPortalStatus due to difference in Approved and Accepted wording
   * for GEF and BSS/EWCS deals
   */
  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF) {
    const portalCommentObj = {
      text: comments,
      decision: mappedPortalStatus,
    };

    // set the comment type to 'ukefDecision'
    portalCommentType = CONSTANTS.DEALS.DEAL_COMMENT_TYPE_PORTAL.UKEF_DECISION;
    // create a POST request to Central-api to update the deal that matches the given dealId
    await api.addUnderwriterCommentToGefDeal(dealId, portalCommentType, portalCommentObj);
  }

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    await sendDealDecisionEmail(mappedDeal);
  }

  return updatedDeal.tfm;
};
exports.updateTfmUnderwriterManagersDecision = updateTfmUnderwriterManagersDecision;

const updateTfmLeadUnderwriter = async (dealId, leadUnderwriter) => {
  const { userId } = leadUnderwriter;

  const leadUnderwriterUpdate = {
    tfm: {
      leadUnderwriter: userId,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, leadUnderwriterUpdate);

  const taskGroupsToUpdate = [CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE, CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE];

  await assignGroupTasksToOneUser(dealId, taskGroupsToUpdate, userId);

  return updatedDeal.tfm;
};
exports.updateTfmLeadUnderwriter = updateTfmLeadUnderwriter;

const updateTfmActivity = async (dealId, activityUpdate) => {
  const updatedActivity = {
    tfm: {
      activities: activityUpdate,
    },
  };
  const updatedDeal = await api.updateDeal(dealId, updatedActivity);
  return updatedDeal.tfm;
};
exports.updateTfmActivity = updateTfmActivity;
