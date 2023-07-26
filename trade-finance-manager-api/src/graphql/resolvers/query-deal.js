const dealReducer = require('../reducers/deal');
const { findOneTfmDeal } = require('../../v1/controllers/deal.controller');
const { filterTasks } = require('./filters/filterTasks');
const { filterActivities } = require('./filters/filterActivities');

const queryDeal = async ({ params }) => {
  try {
    const { _id, tasksFilters, activityFilters } = params;

    const deal = await findOneTfmDeal(_id);

    const filtered = {
      ...deal,
      tfm: {
        ...deal.tfm,
        tasks: filterTasks(deal.tfm.tasks, tasksFilters),
        activities: filterActivities(deal.tfm.activities, activityFilters),
      },
    };

    return dealReducer(filtered);
  } catch (error) {
    console.error('Unable to resolve GQL queryDeal: %O', error);
    return null;
  }
};

module.exports = queryDeal;
