const { multipleBondStatus } = require('./bond');
const { multipleLoanStatus } = require('./loan');
const { aboutSupplyContractStatus } = require('./about');

exports.dealSectionStatuses = (deal) => ({
  ...deal,
  bondTransactions: multipleBondStatus(deal.bondTransactions),
  loanTransactions: multipleLoanStatus(deal.loanTransactions),
  submissionDetails: {
    ...deal.submissionDetails,
    status: aboutSupplyContractStatus(deal.submissionDetails),
  },
});
