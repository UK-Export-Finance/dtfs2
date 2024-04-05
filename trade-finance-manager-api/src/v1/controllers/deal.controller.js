const mapDeal = require('../mappings/map-deal');
const mapDeals = require('../mappings/map-deals');
const api = require('../api');
const acbsController = require('./acbs.controller');
const allPartiesHaveUrn = require('../helpers/all-parties-have-urn');
const CONSTANTS = require('../../constants');
const assignGroupTasksToOneUser = require('../tasks/assign-group-tasks-to-one-user');
const dealReducer = require('../rest-mappings/deal');
const { dealsLightReducer } = require('../rest-mappings/deals-light');
const { filterTasks } = require('../rest-mappings/filters/filterTasks');
const { filterActivities } = require('../rest-mappings/filters/filterActivities');

const getDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const {
      tasksFilterType,
      tasksTeamId,
      tasksUserId,
      activityFilterType,
    } = req.query;
    const taskFilter = {
      filterType: tasksFilterType,
      teamId: tasksTeamId,
      userId: tasksUserId,
    };
    const activityFilter = {
      filterType: activityFilterType,
    };

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
        tasks: filterTasks(deal.tfm.tasks, taskFilter),
        activities: filterActivities(deal.tfm.activities, activityFilter),
      },
    };

    const reducedDeal = dealReducer(filteredDeal);

    return res.status(200).send(reducedDeal);
  } catch (err) {
    console.error('Unable to get deal %o', err);
    return res.status(400).send({ data: 'Unable to get deal' });
  }
};
exports.getDeal = getDeal;

const getDeals = async (req, res) => {
  try {
    const queryParams = req.query;
    const { deals, pagination } = await api.queryDeals({ queryParams });
    const reducedDeals = dealsLightReducer(deals);

    return res.status(200).send({ deals: reducedDeals, pagination });
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
  const { deals, pagination } = await api.queryDeals({ queryParams });

  if (!deals) {
    return false;
  }

  return { deals, pagination };
};

const findTfmDealsLight = async (queryParams) => {
  const { deals, pagination } = await queryDeals(queryParams);
  return { deals, pagination };
};
exports.findTfmDealsLight = findTfmDealsLight;

const findTfmDeals = async (queryParams) => {
  const { deals, pagination } = await queryDeals(queryParams);

  const mapped = await mapDeals(deals);

  return {
    deals: mapped,
    pagination
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
    const updatedDeal = await api.updateDeal(dealId, dealUpdate, req.user);
    return res.status(200).send({
      updateDeal: updatedDeal.tfm,
    });
  } catch (error) {
    console.error('Unable to update deal %o', error);
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

const updateTfmProbabilityOfDefault = async (dealId, probabilityOfDefault) => {
  const probabilityOfDefaultUpdate = {
    tfm: {
      probabilityOfDefault,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, probabilityOfDefaultUpdate, {});

  return updatedDeal.tfm;
};
exports.updateTfmProbabilityOfDefault = updateTfmProbabilityOfDefault;

const updateTfmLeadUnderwriter = async (dealId, leadUnderwriterUpdateRequest, sessionUser) => {
  const { userId } = leadUnderwriterUpdateRequest;
  const leadUnderwriterUpdate = {
    tfm: {
      leadUnderwriter: userId,
    },
  };

  const updatedDealOrError = await api.updateDeal(
    dealId,
    leadUnderwriterUpdate,
    sessionUser,
    (status, message) => {
      throw new Error(`Updating the deal with dealId ${dealId} failed with status ${status} and message: ${message}`);
    }
  );

  const taskGroupsToUpdate = [CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE, CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE];

  await assignGroupTasksToOneUser(dealId, taskGroupsToUpdate, userId, sessionUser);

  return updatedDealOrError.tfm;
};

const updateLeadUnderwriter = async (req, res) => {
  try {
    const { dealId } = req.params;

    const leadUnderwriterUpdate = req.body;

    const updatedDealTfm = await updateTfmLeadUnderwriter(dealId, leadUnderwriterUpdate, req.user);

    return res.status(200).send(updatedDealTfm);
  } catch (error) {
    console.error('Unable to update lead underwriter %o', error);
    return res.status(500).send({ data: 'Unable to update lead underwriter' });
  }
};
exports.updateLeadUnderwriter = updateLeadUnderwriter;
