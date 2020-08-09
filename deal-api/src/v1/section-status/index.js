const { addAccurateStatusesToBonds } = require('./bonds');
const { addAccurateStatusesToLoans } = require('./loans');
const { aboutSupplyContractStatus } = require('./about');

exports.dealSectionStatuses = (deal) => ({
  ...deal,
  bondTransactions: addAccurateStatusesToBonds(deal.details.status, deal.details.submissionType, deal.bondTransactions),
  loanTransactions: addAccurateStatusesToLoans(deal.details.status, deal.details.submissionType, deal.loanTransactions),
  submissionDetails: {
    ...deal.submissionDetails,
    status: aboutSupplyContractStatus(deal.submissionDetails),
  },
});
