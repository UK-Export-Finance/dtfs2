const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');

const createApprovalDate = async (dealId, user) => {
  const modifiedDeal = {
    details: {
      approvalDate: getNowAsEpochMillisecondString(),
    },
  };

  const updatedDeal = await updateDeal(dealId, modifiedDeal, null, user);

  return updatedDeal;
};

module.exports = createApprovalDate;
