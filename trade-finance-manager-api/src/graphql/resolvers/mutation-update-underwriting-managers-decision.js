const { updateTfmUnderwritingManagersDecision } = require('../../v1/controllers/deal.controller');

const updateUnderwritingManagersDecision = async ({ dealId, managersDecisionUpdate }) => {
  const {
    decision,
    comments,
  } = managersDecisionUpdate;

  const update = await updateTfmUnderwritingManagersDecision(dealId, decision, comments);
  return update;
};

module.exports = updateUnderwritingManagersDecision;
