const api = require('../api');
const DEFAULTS = require('../defaults');
const CONSTANTS = require('../../constants');
const { createTasks } = require('../helpers/create-tasks');

/**
 * Tasks to exclude, depending on deal data.
 **/
const listExcludedTasks = (deal) => {
  const { tfm } = deal;
  const exporterPartyUrn = tfm.parties.exporter.partyUrn;

  let excludedTasks = [];

  if (exporterPartyUrn) {
    excludedTasks = [
      CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
    ];
  }

  return excludedTasks;
};

/**
 * Additional tasks to include, depending on deal data.
 **/
const listAdditionalTasks = (deal) => {
  const {
    dealType,
    submissionType,
  } = deal;

  let additionalTasks = [];

  if (dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS
    && submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    const { eligibility } = deal;

    const eligibilityCriterion11 = eligibility.criteria.find((criterion) =>
      criterion.id === 11);

    const eligibilityCriteria11isFalse = eligibilityCriterion11.answer === false;

    if (eligibilityCriteria11isFalse) {
      additionalTasks = [
        CONSTANTS.TASKS.MIA_GROUP_1_TASKS.COMPLETE_AGENT_CHECK,
      ];
    }
  }

  return additionalTasks;
};

const createDealTasks = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    dealType,
    submissionType,
    tfm,
  } = deal;

  const excludedTasks = listExcludedTasks(deal);
  const additionalTasks = listAdditionalTasks(deal);

  const tasks = createTasks(
    submissionType,
    excludedTasks,
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
  listExcludedTasks,
  listAdditionalTasks,
  createDealTasks,
};
