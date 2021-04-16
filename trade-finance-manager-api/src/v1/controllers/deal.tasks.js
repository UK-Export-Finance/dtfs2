const api = require('../api');
const DEFAULTS = require('../defaults');
const CONSTANTS = require('../../constants');

const createDealTasks = async (deal) => {
  if (!deal) {
    return false;
  }

  const {
    tfm,
    dealSnapshot,
  } = deal;

  const {
    _id: dealId, // eslint-disable-line no-underscore-dangle
    details,
  } = dealSnapshot;

  const { submissionType } = details;

  let tasks;

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN) {
    tasks = DEFAULTS.TASKS.AIN;
  }

  if (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    tasks = DEFAULTS.TASKS.MIA;
  }

  const dealUpdate = {
    tfm: {
      ...tfm,
      tasks,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, dealUpdate);

  return {
    dealSnapshot,
    tfm: updatedDeal.tfm,
  };
};

exports.createDealTasks = createDealTasks;
