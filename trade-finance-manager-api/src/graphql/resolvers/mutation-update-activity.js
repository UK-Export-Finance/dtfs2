const { updateTfmActivity } = require('../../v1/controllers/deal.controller');

const createActivity = async ({ dealId, activityUpdate }) => {
  const update = updateTfmActivity(dealId, activityUpdate);
  return update;
};

module.exports = createActivity;
