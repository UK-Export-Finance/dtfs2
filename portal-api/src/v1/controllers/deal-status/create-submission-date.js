const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');

const createSubmissionDate = async (dealId, user) => {
  const modifiedDeal = {
    details: {
      submissionDate: getNowAsEpochMillisecondString(),
      checker: user,
    },
  };

  const updatedDeal = await updateDeal(dealId, modifiedDeal, user);

  return updatedDeal;
};

module.exports = createSubmissionDate;
