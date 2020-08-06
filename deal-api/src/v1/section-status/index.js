const { addAccurateStatusesToBonds } = require('./bonds');
const { addAccurateStatusesToLoans } = require('./loans');
const { aboutSupplyContractStatus } = require('./about');

exports.dealSectionStatuses = (deal) => ({
  ...deal,
  bondTransactions: addAccurateStatusesToBonds(deal.bondTransactions),
  loanTransactions: addAccurateStatusesToLoans(deal.loanTransactions),
  submissionDetails: {
    ...deal.submissionDetails,
    status: aboutSupplyContractStatus(deal.submissionDetails),
  },
});
