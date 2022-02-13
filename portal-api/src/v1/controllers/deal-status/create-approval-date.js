const { updateDeal } = require('../deal.controller');
const now = require('../../../utils/now.util');

const createApprovalDate = async (dealId) => {
  const modifiedDeal = {
    details: {
      approvalDate: now(),
    },
  };

  const updatedDeal = await updateDeal(
    dealId,
    modifiedDeal,
  );

  return updatedDeal;
};

module.exports = createApprovalDate;
