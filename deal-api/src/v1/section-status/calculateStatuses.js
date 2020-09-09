const { addAccurateStatusesToBonds } = require('./bonds');
const { addAccurateStatusesToLoans } = require('./loans');
const aboutSupplyContractStatus = require('./aboutSupplyContractStatus');

module.exports = (deal, validationErrors) => ({
  ...deal,
  bondTransactions: addAccurateStatusesToBonds(
    deal.details.status,
    deal.details.previousStatus,
    deal.details.submissionType,
    deal.details.submissionDate,
    deal.details.manualInclusionNoticeSubmissionDate,
    deal.bondTransactions,
    validationErrors.bondErrors,
  ),
  loanTransactions: addAccurateStatusesToLoans(
    deal.details.status,
    deal.details.previousStatus,
    deal.details.submissionType,
    deal.details.submissionDate,
    deal.details.manualInclusionNoticeSubmissionDate,
    deal.loanTransactions,
    validationErrors.loanErrors,
  ),
  submissionDetails: {
    ...deal.submissionDetails,
    status: aboutSupplyContractStatus(deal.submissionDetails, validationErrors.submissionDetailsErrors),
  },
});
