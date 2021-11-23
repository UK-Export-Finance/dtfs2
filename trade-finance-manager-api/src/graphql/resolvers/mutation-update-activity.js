const { updateTfmActivity } = require('../../v1/controllers/deal.controller');

const createActivity = async ({ dealId, activityUpdate }) => updateTfmActivity(dealId, activityUpdate);

module.exports = createActivity;
