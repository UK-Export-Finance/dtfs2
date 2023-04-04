const { updateTfmActivity } = require('../../v1/controllers/deal.controller');

const createActivity = ({ dealId, activityUpdate }) => updateTfmActivity(dealId, activityUpdate);

module.exports = createActivity;
