const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');

const createMiaSubmissionDate = async (dealId) => {
  const modifiedDeal = {
    details: {
      manualInclusionApplicationSubmissionDate: getNowAsEpochMillisecondString(),
    },
  };

  const updatedDeal = await updateDeal(
    dealId,
    modifiedDeal,
  );

  return updatedDeal;
};

module.exports = createMiaSubmissionDate;
