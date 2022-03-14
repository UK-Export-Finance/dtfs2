const api = require('../api');
const CONSTANTS = require('../../constants');
const { createTasks } = require('../helpers/create-tasks');

/**
 * Conditions for adding 'create or match parties' task
 * */
const shouldCreatePartiesTask = (deal) => {
  const { tfm } = deal;
  const exporterPartyUrn = tfm.parties.exporter.partyUrn;

  if (exporterPartyUrn && exporterPartyUrn.length) {
    return false;
  }

  return true;
};

/**
 * Conditions for adding 'check agent' task
 * */
const shouldCreateAgentCheckTask = (deal) => {
  const {
    dealType,
    submissionType,
  } = deal;

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS
    && submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    const { eligibility } = deal;

    const eligibilityCriterion11 = eligibility.criteria.find((criterion) =>
      criterion.id === 11);

    const eligibilityCriteria11isFalse = (eligibilityCriterion11.answer === false);

    if (eligibilityCriteria11isFalse) {
      return true;
    }
  }

  return false;
};

/**
 * Additional/conditional tasks to include, depending on deal data.
 * */
const listAdditionalTasks = (deal) => {
  const additionalTasks = [];

  if (shouldCreatePartiesTask(deal)) {
    additionalTasks.push(CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES);
  }

  if (shouldCreateAgentCheckTask(deal)) {
    additionalTasks.push(CONSTANTS.TASKS.MIA_GROUP_1_TASKS.COMPLETE_AGENT_CHECK);
  }

  return additionalTasks;
};

const createDealTasks = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    _id: dealId,
    submissionType,
    tfm,
  } = deal;

  const additionalTasks = listAdditionalTasks(deal);

  const tasks = createTasks(
    submissionType,
    additionalTasks,
  );

  const dealUpdate = {
    tfm: {
      ...tfm,
      tasks,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, dealUpdate);

  return {
    ...deal,
    tfm: updatedDeal.tfm,
  };
};

module.exports = {
  shouldCreatePartiesTask,
  shouldCreateAgentCheckTask,
  listAdditionalTasks,
  createDealTasks,
};
