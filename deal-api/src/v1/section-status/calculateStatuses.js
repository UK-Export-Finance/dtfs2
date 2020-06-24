const addAccurateStatusesToBonds = require('./addAccurateStatusesToBonds');
const addAccurateStatusesToLoans = require('./addAccurateStatusesToLoans');
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
