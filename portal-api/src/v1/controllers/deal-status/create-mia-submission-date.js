const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');

const createMiaSubmissionDate = async (dealId, auditDetails) => {
  const dealUpdate = {
    details: {
      manualInclusionApplicationSubmissionDate: getNowAsEpochMillisecondString(),
    },
  };

  const updatedDeal = await updateDeal({ dealId, dealUpdate, auditDetails });

  return updatedDeal;
};

module.exports = createMiaSubmissionDate;
