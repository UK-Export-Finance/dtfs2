const api = require('../api');
const DEFAULTS = require('../defaults');
const CONSTANTS = require('../../constants');
const { createTasks } = require('../helpers/create-tasks');

const createDealTasks = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    submissionType,
    tfm,
  } = deal;

  let tasks;

  const exporterPartyUrn = tfm.parties.exporter.partyUrn;

  let excludedTasks = [];

  if (exporterPartyUrn) {
    excludedTasks = [
      CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
    ];
  }

  tasks = createTasks(
    submissionType,
    excludedTasks,
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

exports.createDealTasks = createDealTasks;
