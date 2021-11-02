const getDealSubmissionDate = (deal) => deal.dealSnapshot.submissionDate || deal.submittedDate;

module.exports = getDealSubmissionDate;
