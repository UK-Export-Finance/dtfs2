const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');

const createMiaSubmissionDate = async (dealId, auditDetails) => {
  const modifiedDeal = {
    details: {
      manualInclusionApplicationSubmissionDate: getNowAsEpochMillisecondString(),
    },
  };

  const updatedDeal = await updateDeal(dealId, modifiedDeal, undefined, auditDetails);

  return updatedDeal;
};

module.exports = createMiaSubmissionDate;
