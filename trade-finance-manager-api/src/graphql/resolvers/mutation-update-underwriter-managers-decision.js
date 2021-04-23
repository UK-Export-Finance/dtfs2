const { updateTfmUnderwriterManagersDecision } = require('../../v1/controllers/deal.controller');

const updateUnderwriterManagersDecision = async ({ dealId, managersDecisionUpdate }) => {
  const {
    decision,
    comments,
    internalComments,
  } = managersDecisionUpdate;

  const update = await updateTfmUnderwriterManagersDecision(
    dealId,
    decision,
    comments,
    internalComments,
  );

  return update;
};

module.exports = updateUnderwriterManagersDecision;
