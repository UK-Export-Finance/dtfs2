const { updateTfmLossGivenDefault } = require('../../v1/controllers/deal.controller');

const updateLossGivenDefault = async ({ dealId, lossGivenDefaultUpdate }) => {
  const { lossGivenDefault } = lossGivenDefaultUpdate;
  const update = await updateTfmLossGivenDefault(dealId, lossGivenDefault);
  return update;
};

module.exports = updateLossGivenDefault;
