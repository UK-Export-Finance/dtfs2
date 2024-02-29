const { updateDeal } = require('../deal.controller');
const now = require('../../../now');

const createMiaSubmissionDate = async (dealId, user) => {
  const modifiedDeal = {
    details: {
      manualInclusionApplicationSubmissionDate: now(),
    },
  };

  const updatedDeal = await updateDeal(
    dealId,
    modifiedDeal,
    user,
  );

  return updatedDeal;
};

module.exports = createMiaSubmissionDate;
