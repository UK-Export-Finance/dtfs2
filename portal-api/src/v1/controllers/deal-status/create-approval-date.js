const { updateDeal } = require('../deal.controller');
const now = require('../../../now');

const createApprovalDate = async (dealId, user) => {
  const modifiedDeal = {
    details: {
      approvalDate: now(),
    },
  };

  const updatedDeal = await updateDeal(dealId, modifiedDeal, user);

  return updatedDeal;
};

module.exports = createApprovalDate;
