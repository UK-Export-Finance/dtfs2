const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');

const createApprovalDate = async (dealId, auditDetails) => {
  const modifiedDeal = {
    details: {
      approvalDate: getNowAsEpochMillisecondString(),
    },
  };

  const updatedDeal = await updateDeal(dealId, modifiedDeal, undefined, auditDetails);

  return updatedDeal;
};

module.exports = createApprovalDate;
