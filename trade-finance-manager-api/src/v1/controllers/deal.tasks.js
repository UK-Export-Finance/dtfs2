const api = require('../api');
const DEFAULTS = require('../defaults');

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
  } = dealSnapshot;

  const dealUpdate = {
    tfm: {
      ...tfm,
      tasks: DEFAULTS.TASKS.AIN,
    },
  };

  const updatedDeal = await api.updateDeal(dealId, dealUpdate);

  return {
    dealSnapshot,
    tfm: updatedDeal.tfm,
  };
};

exports.createDealTasks = createDealTasks;
