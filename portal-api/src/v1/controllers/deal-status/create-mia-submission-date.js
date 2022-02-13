const { updateDeal } = require('../deal.controller');
const now = require('../../../utils/now.util');

const createMiaSubmissionDate = async (dealId) => {
  const modifiedDeal = {
    details: {
      manualInclusionApplicationSubmissionDate: now(),
    },
  };

  const updatedDeal = await updateDeal(
    dealId,
    modifiedDeal,
  );

  return updatedDeal;
};

module.exports = createMiaSubmissionDate;
