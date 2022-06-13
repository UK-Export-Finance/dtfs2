const { updateTfmProbabilityOfDefault } = require('../../v1/controllers/deal.controller');

const updateProbabilityOfDefault = async ({ dealId, probabilityOfDefaultUpdate }) => {
  const { probabilityOfDefault } = probabilityOfDefaultUpdate;

  const update = await updateTfmProbabilityOfDefault(dealId, probabilityOfDefault);
  return update;
};

module.exports = updateProbabilityOfDefault;
