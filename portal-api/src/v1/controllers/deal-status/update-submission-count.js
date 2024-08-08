const { updateDeal } = require('../deal.controller');

/**
 * Updates the submission count of a deal and returns the updated deal.
 * @param {object} deal - The deal object.
 * @param {object} user - The user object.
 * @param {import("@ukef/dtfs2-common").AuditDetails} auditDetails - user making the request
 * @returns {Promise<object>} - The updated deal object with submission count incremented.
 */
const updateSubmissionCount = async (deal, user, auditDetails) => {
  const { _id: dealId } = deal;
  let submissionCount = 1;

  if (deal?.details?.submissionCount) {
    submissionCount = Number(deal.details.submissionCount) + 1;
  }

  const dealUpdate = {
    details: {
      submissionCount,
    },
  };

  const updatedDeal = await updateDeal({ dealId, dealUpdate, user, auditDetails });

  return updatedDeal;
};

module.exports = updateSubmissionCount;
