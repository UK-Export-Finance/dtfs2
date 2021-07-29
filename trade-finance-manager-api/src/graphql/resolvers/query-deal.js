const dealReducer = require('../reducers/deal');
const { findOneTfmDeal } = require('../../v1/controllers/deal.controller');
const { filterTasks } = require('./filters/filterTasks');

require('dotenv').config();

const queryDeal = async ({ params }) => {
  const { _id, tasksFilters } = params;

  const deal = await findOneTfmDeal(_id);

  const filtered = {
    ...deal,
    tfm: {
      ...deal.tfm,
      tasks: filterTasks(deal.tfm.tasks, tasksFilters),
    },
  };

  return dealReducer(filtered);
};

module.exports = queryDeal;
