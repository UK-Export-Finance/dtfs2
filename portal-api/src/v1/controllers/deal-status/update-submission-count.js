const { updateDeal } = require('../deal.controller');

/**
 * Updates the submission count of a deal and returns the updated deal.
 * @param {Object} deal - The deal object.
 * @param {Object} user - The user object.
 * @returns {Promise<Object>} - The updated deal object with submission count incremented.
 */
const updateSubmissionCount = async (deal, user, auditDetails) => {
  const { _id: dealId } = deal;
  let submissionCount = 1;

  if (deal?.details?.submissionCount) {
    submissionCount = Number(deal.details.submissionCount) + 1;
  }

  const modifiedDeal = {
    details: {
      submissionCount,
    },
  };

  const updatedDeal = await updateDeal(dealId, modifiedDeal, user, auditDetails);

  return updatedDeal;
};

module.exports = updateSubmissionCount;
