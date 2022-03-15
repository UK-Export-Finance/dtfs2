const { updateDeal } = require('../deal.controller');

const updateSubmissionCount = async (deal, user) => {
  const dealId = deal._id;

  let submissionCount = 1;
  if (deal.details.submissionCount) {
    submissionCount = deal.details.submissionCount + 1;
  }

  const modifiedDeal = {
    details: {
      submissionCount,
    },
  };

  const updatedDeal = await updateDeal(
    dealId,
    modifiedDeal,
    user,
  );

  return updatedDeal;
};

module.exports = updateSubmissionCount;
