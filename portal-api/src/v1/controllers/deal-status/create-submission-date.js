const { updateDeal } = require('../deal.controller');
const { getNowAsEpochMillisecondString } = require('../../helpers/date');

const createSubmissionDate = async (dealId, user, auditDetails) => {
  const dealUpdate = {
    details: {
      submissionDate: getNowAsEpochMillisecondString(),
      checker: user,
    },
  };

  const updatedDeal = await updateDeal({ dealId, dealUpdate, user, auditDetails });

  return updatedDeal;
};

module.exports = createSubmissionDate;
