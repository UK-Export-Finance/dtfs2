const { addAccurateStatusesToBonds } = require('./bonds');
const { addAccurateStatusesToLoans } = require('./loans');
const aboutSupplyContractStatus = require('./aboutSupplyContractStatus');

module.exports = (deal, validationErrors) => ({
  ...deal,
  bondTransactions: addAccurateStatusesToBonds(deal),
  loanTransactions: addAccurateStatusesToLoans(deal),
  submissionDetails: {
    ...deal.submissionDetails,
    status: aboutSupplyContractStatus(deal.submissionDetails, validationErrors.submissionDetailsErrors),
  },
});
