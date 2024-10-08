const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');

const createApprovalDate = async (dealId, auditDetails) => {
  const dealUpdate = {
    details: {
      approvalDate: getNowAsEpochMillisecondString(),
    },
  };

  const updatedDeal = await updateDeal({ dealId, dealUpdate, auditDetails });

  return updatedDeal;
};

module.exports = createApprovalDate;
