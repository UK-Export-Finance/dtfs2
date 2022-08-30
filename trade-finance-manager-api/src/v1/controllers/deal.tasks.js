const api = require('../api');
const CONSTANTS = require('../../constants');
const { createTasks } = require('../helpers/create-tasks');

/**
 * Check if the "create or match parties" task should be created
 * if BSS, show task if either buyer or exporter party URN are not present
 * if GEF, show task if exporter party URN is not present
 * @param {Object} deal
 * @returns {Boolean}
 */
const shouldCreatePartiesTask = (deal) => {
  const { dealType, tfm } = deal;
  const { BSS_EWCS } = CONSTANTS.DEALS.DEAL_TYPE;
  // exporter party URN
  const exporterPartyUrn = tfm.parties?.exporter?.partyUrn;
  // buyer party URN
  const buyerPartyUrn = tfm.parties?.buyer?.partyUrn;
  // boolean if exporter party URN exists and is not empty
  const exporterPartyUrnExists = exporterPartyUrn && exporterPartyUrn.trim().length;

  // if BSS, then need to check buyer party URN and exporter party URN
  if (dealType === BSS_EWCS) {
    // boolean if buyer party URN exists and is not empty
    const buyerPartyUrnExists = buyerPartyUrn && buyerPartyUrn.trim().length;
    // if either does not exist, then show task
    return !buyerPartyUrnExists || !exporterPartyUrnExists;
  }

  // show task if exporter party urn does not exist
  return !exporterPartyUrnExists;
};

/**
 * Check if the "check agent" task should be created
 * @param {Object} deal
 * @returns {Boolean}
 */
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
 * Get additional/conditional tasks that should be added to tasks, depending on deal data.
 * @param {Object} deal
 * @returns {Array}
 */
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

/**
 * Get additional/conditional tasks that should be added to tasks, depending on deal data.
 * @param {Object} deal
 * @returns {Object} deal with tasks
 */
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
