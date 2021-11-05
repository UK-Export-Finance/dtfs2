const { updateTfmActivity } = require('../../v1/controllers/deal.controller');

const updateActivity = async ({ dealId, activityUpdate }) => {
  const update = updateTfmActivity(dealId, activityUpdate);
  return update;
};

module.exports = updateActivity;
