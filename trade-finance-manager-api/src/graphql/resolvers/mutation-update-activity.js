const { updateTfmActivity } = require('../../v1/controllers/deal.controller');

const createActivity = async ({ dealId, activityUpdate }) => { console.log(activityUpdate, dealId);
    return updateTfmActivity(dealId, activityUpdate); };

module.exports = createActivity;
