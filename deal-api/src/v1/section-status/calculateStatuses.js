const { addAccurateStatusesToBonds } = require('./bonds');
const { addAccurateStatusesToLoans } = require('./loans');
const aboutSupplyContractStatus = require('./aboutSupplyContractStatus');

module.exports = (deal, validationErrors) => ({
  ...deal,
  bondTransactions: addAccurateStatusesToBonds(deal.bondTransactions, validationErrors.bondErrors),
  loanTransactions: addAccurateStatusesToLoans(deal.loanTransactions, validationErrors.loanErrors),
  submissionDetails: {
    ...deal.submissionDetails,
    status: aboutSupplyContractStatus(deal.submissionDetails, validationErrors.submissionDetailsErrors),
  },
});
