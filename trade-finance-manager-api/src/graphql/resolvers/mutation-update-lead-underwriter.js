const { updateTfmLeadUnderwriter } = require('../../v1/controllers/deal.controller');

const updateLeadUnderwriter = async ({ dealId, leadUnderwriterUpdate }) => {
  const update = await updateTfmLeadUnderwriter(dealId, leadUnderwriterUpdate);
  return update;
};

module.exports = updateLeadUnderwriter;
