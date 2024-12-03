const getDealSubmissionDate = (deal) => deal.dealSnapshot.submissionDate || deal.dealSnapshot.details.submissionDate;

module.exports = getDealSubmissionDate;
