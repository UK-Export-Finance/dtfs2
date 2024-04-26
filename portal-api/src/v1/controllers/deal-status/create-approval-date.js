const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');

const createApprovalDate = async (dealId) => {
  const modifiedDeal = {
    details: {
      approvalDate: getNowAsEpochMillisecondString(),
    },
  };

  const updatedDeal = await updateDeal(
    dealId,
    modifiedDeal,
  );

  return updatedDeal;
};

module.exports = createApprovalDate;
