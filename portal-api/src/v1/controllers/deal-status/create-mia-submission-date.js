const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');

const createMiaSubmissionDate = async (dealId, user) => {
  const modifiedDeal = {
    details: {
      manualInclusionApplicationSubmissionDate: getNowAsEpochMillisecondString(),
    },
  };

  const updatedDeal = await updateDeal(
    dealId,
    modifiedDeal,
    null,
    user,
  );

  return updatedDeal;
};

module.exports = createMiaSubmissionDate;
